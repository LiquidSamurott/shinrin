pub mod engine;
pub mod generation;
pub mod language;
pub mod prompt;
pub mod quality;
pub mod response;
pub mod web_search;

pub use engine::{AiEngine, TaskMode};

pub use web_search::{
    test_searxng_connection,
    test_searxng_search,
};

use crate::ai_state::AiState;

use language::detect_language;
use quality::evaluate;
use response::clean_response;

use web_search::{
    format_search_context,
    WebSearch,
};

use serde::{
    Deserialize,
    Serialize,
};

use std::fs;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::oneshot;

const MAX_REGENERATION_ATTEMPTS: usize = 3;
const MAX_SEARCH_RESULTS: usize = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiAttachment {
    pub id: String,
    pub name: String,
    pub attachment_type: String,
    pub mime_type: String,
    pub size: u64,

    #[serde(default)]
    pub path: Option<String>,

    #[serde(default)]
    pub extracted_text: Option<String>,

    #[serde(default)]
    pub base64: Option<String>,
}

fn is_readable_text_file(path_str: &str, mime_type: &str) -> bool {
    if mime_type.starts_with("text/")
        || mime_type == "application/json"
        || mime_type == "application/javascript"
        || mime_type == "application/typescript"
        || mime_type == "application/xml"
    {
        return true;
    }

    let extension = Path::new(path_str)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();

    // Expression evaluates directly to bool
    matches!(
        extension.as_str(),
        "txt"
            | "md"
            | "markdown"
            | "json"
            | "csv"
            | "tsv"
            | "xml"
            | "html"
            | "css"
            | "js"
            | "ts"
            | "jsx"
            | "tsx"
            | "rs"
            | "py"
            | "c"
            | "cpp"
            | "h"
            | "hpp"
            | "java"
            | "go"
            | "rb"
            | "php"
            | "sh"
            | "yaml"
            | "yml"
            | "toml"
            | "ini"
            | "env"
            | "log"
    );
    return false;
}

fn resolve_attachment_text(attachment: &AiAttachment) -> Option<String> {
    if let Some(path_str) = &attachment.path {
        if !path_str.trim().is_empty() && is_readable_text_file(path_str, &attachment.mime_type) {
            if let Ok(content) = fs::read_to_string(path_str) {
                if !content.trim().is_empty() {
                    return Some(content);
                }
            }
        }
    }

    if let Some(text) = &attachment.extracted_text {
        if !text.trim().is_empty() {
            return Some(text.clone());
        }
    }

    None
}

#[tauri::command]
pub async fn ai_chat(
    prompt: String,
    attachments: Vec<AiAttachment>,
    use_web: bool,
    searxng_url: String,
    mode: Option<String>,
    seed: Option<u32>,
    state: tauri::State<'_, AiState>,
) -> Result<String, String> {
    let prompt = prompt.trim().to_string();

    if prompt.is_empty() && attachments.is_empty() {
        return Err("Prompt and attachments cannot both be empty.".to_string());
    }

    let initial_task_mode = match mode.as_deref() {
        Some("focused") => TaskMode::Focused,
        Some("mindmap") => TaskMode::Mindmap,
        Some("creative") => TaskMode::Creative,
        _ => TaskMode::Normal,
    };

    let mut attachment_context = String::new();

    for attachment in &attachments {
        attachment_context.push_str(&format!(
            "\n\n===== FILE: {} =====\n",
            attachment.name
        ));

        attachment_context.push_str(&format!(
            "Type: {}\n",
            attachment.mime_type
        ));

        if let Some(file_text) = resolve_attachment_text(attachment) {
            attachment_context.push_str("\nContent:\n");
            attachment_context.push_str(&file_text);
        } else {
            attachment_context.push_str("\n[Binary or unreadable file content omitted]\n");
        }

        attachment_context.push_str("\n===== END FILE =====\n");
    }

    let full_prompt = format!("{}{}", prompt, attachment_context);
    let language = detect_language(&full_prompt);

    let web_context = if use_web {
        let url = searxng_url.trim();

        if url.is_empty() {
            return Err("Web search is enabled, but no SearXNG URL is configured.".to_string());
        }

        let search = WebSearch::new(url).map_err(|error| {
            format!("Failed to initialize SearXNG: {}", error)
        })?;

        let results = search
            .search(&full_prompt, language, MAX_SEARCH_RESULTS)
            .await
            .map_err(|error| format!("SearXNG search failed: {}", error))?;

        format_search_context(&results)
    } else {
        String::new()
    };

    let engine = Arc::clone(&state.engine);
    let (tx, rx) = oneshot::channel();

    // Spawns a dedicated OS thread with an 8MB stack to prevent 0xc0000409 stack overruns
    std::thread::Builder::new()
        .name("ai-inference".into())
        .stack_size(8 * 1024 * 1024)
        .spawn(move || {
            let res = (|| {
                let engine = engine
                    .lock()
                    .map_err(|_| "AI engine mutex is poisoned due to a previous panic".to_string())?;

                let mut last_issues = Vec::<String>::new();

                for attempt in 1..=MAX_REGENERATION_ATTEMPTS {
                    let current_mode = if attempt > 1 {
                        TaskMode::Regeneration(attempt)
                    } else {
                        initial_task_mode
                    };

                    let raw_response = generation::generate(
                        &engine,
                        &full_prompt,
                        language,
                        if web_context.is_empty() {
                            None
                        } else {
                            Some(&web_context)
                        },
                        current_mode,
                        seed,
                    )
                    .map_err(|error| {
                        format!(
                            "AI generation failed on attempt {}: {}",
                            attempt, error
                        )
                    })?;

                    let cleaned = clean_response(&raw_response);
                    let report = evaluate(&cleaned, language);

                    if report.is_acceptable() {
                        return Ok(cleaned);
                    }

                    last_issues = report.issues.clone();

                    if !report.needs_regeneration() {
                        break;
                    }
                }

                Err(format!(
                    "AI response failed quality checks after {} attempts: {}",
                    MAX_REGENERATION_ATTEMPTS,
                    last_issues.join("; ")
                ))
            })();

            let _ = tx.send(res);
        })
        .map_err(|e| format!("Failed to spawn AI inference thread: {}", e))?;

    rx.await
        .map_err(|_| "AI inference thread panicked".to_string())?
}