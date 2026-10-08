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

/* ============================================================
   AI QUIZ GENERATION
============================================================ */

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateQuizRequest {
    pub topic: String,
    pub subject: String,
    pub difficulty: String,
    pub question_count: usize,
    pub question_types: Vec<String>,

    #[serde(default)]
    pub instructions: String,
}

fn build_quiz_generation_prompt(
    request: &GenerateQuizRequest,
) -> Result<String, String> {
    let topic = request.topic.trim();

    if topic.is_empty() {
        return Err("Quiz topic cannot be empty.".to_string());
    }

    let question_count = request.question_count.clamp(1, 8);

    let allowed_types = [
        "multiple_choice",
        "multiple_select",
        "true_false",
        "short_answer",
        "numeric",
        "fill_blank",
        "ordering",
        "matching",
        "code_output",
        "code_completion",
        "equation",
    ];

    let question_types = if request.question_types.is_empty() {
        vec!["multiple_choice".to_string()]
    } else {
        request.question_types.clone()
    };

    for question_type in &question_types {
        if !allowed_types.contains(&question_type.as_str()) {
            return Err(format!(
                "Unsupported quiz question type: {}",
                question_type
            ));
        }
    }

    let type_list = question_types.join(", ");

    Ok(format!(
r#"
You are Shinrin's local quiz generator.

CRITICAL MANDATE:
You MUST generate EXACTLY {question_count} items in the "questions" array.
Do not generate fewer than {question_count} questions.
Do not generate more than {question_count} questions.

Topic: {topic}
Subject: {subject}
Difficulty: {difficulty}

Allowed question types:
{type_list}

Additional instructions:
{instructions}

============================================================
OUTPUT REQUIREMENTS
============================================================

RETURN ONLY VALID JSON.

Do not use Markdown.
Do not use ```json.
Do not write explanations outside the JSON.
Do not add comments.

The top-level object MUST be:

{{
  "title": "string",
  "description": "string",
  "subject": "string",
  "difficulty": "easy",
  "questions": [
    /* MUST CONTAIN EXACTLY {question_count} QUESTION OBJECTS */
  ]
}}

The difficulty must be exactly one of:

"easy"
"medium"
"hard"

============================================================
RICH TEXT / LATEX
============================================================

All human-readable text must be HTML.

Use:

<p>Text</p>

<strong>Important</strong>

<em>emphasis</em>

For inline mathematics use:

<span data-latex="x^2" data-type="inline-math"></span>

For display mathematics use:

<div data-latex="\lim_{{x \to 0}} \frac{{\sin x}}{{x}}" data-type="block-math"></div>

NEVER use:

$...$

$$...$$

Markdown math.

NEVER put raw LaTeX directly into normal HTML text.

============================================================
QUESTION STRUCTURE
============================================================

Every question MUST have:

{{
  "type": "...",
  "prompt": "<p>...</p>",
  "content": {{ }},
  "explanation": "<p>...</p>"
}}

============================================================
MULTIPLE CHOICE
============================================================

{{
  "type": "multiple_choice",
  "prompt": "<p>...</p>",
  "content": {{
    "options": [
      {{ "id": "a", "text": "<p>...</p>" }},
      {{ "id": "b", "text": "<p>...</p>" }},
      {{ "id": "c", "text": "<p>...</p>" }},
      {{ "id": "d", "text": "<p>...</p>" }}
    ],
    "correctAnswer": "a"
  }},
  "explanation": "<p>...</p>"
}}

============================================================
MULTIPLE SELECT
============================================================

{{
  "type": "multiple_select",
  "prompt": "<p>...</p>",
  "content": {{
    "options": [
      {{ "id": "a", "text": "<p>...</p>" }},
      {{ "id": "b", "text": "<p>...</p>" }},
      {{ "id": "c", "text": "<p>...</p>" }},
      {{ "id": "d", "text": "<p>...</p>" }}
    ],
    "correctAnswers": ["a", "c"]
  }},
  "explanation": "<p>...</p>"
}}

============================================================
TRUE / FALSE
============================================================

{{
  "type": "true_false",
  "prompt": "<p>...</p>",
  "content": {{
    "correctAnswer": true
  }},
  "explanation": "<p>...</p>"
}}

============================================================
SHORT ANSWER
============================================================

{{
  "type": "short_answer",
  "prompt": "<p>...</p>",
  "content": {{
    "correctAnswer": "answer"
  }},
  "explanation": "<p>...</p>"
}}

============================================================
NUMERIC
============================================================

{{
  "type": "numeric",
  "prompt": "<p>...</p>",
  "content": {{
    "correctAnswer": 42,
    "tolerance": 0
  }},
  "explanation": "<p>...</p>"
}}

============================================================
FILL BLANK
============================================================

{{
  "type": "fill_blank",
  "prompt": "<p>...</p>",
  "content": {{
    "correctAnswer": "answer",
    "acceptedAnswers": ["answer", "alternate answer"]
  }},
  "explanation": "<p>...</p>"
}}

============================================================
ORDERING
============================================================

{{
  "type": "ordering",
  "prompt": "<p>...</p>",
  "content": {{
    "items": [
      {{ "id": "item1", "text": "<p>...</p>" }},
      {{ "id": "item2", "text": "<p>...</p>" }},
      {{ "id": "item3", "text": "<p>...</p>" }}
    ],
    "correctOrder": ["item2", "item1", "item3"]
  }},
  "explanation": "<p>...</p>"
}}

============================================================
MATCHING
============================================================

{{
  "type": "matching",
  "prompt": "<p>...</p>",
  "content": {{
    "left": [
      {{ "id": "left1", "text": "<p>...</p>" }},
      {{ "id": "left2", "text": "<p>...</p>" }}
    ],
    "right": [
      {{ "id": "right1", "text": "<p>...</p>" }},
      {{ "id": "right2", "text": "<p>...</p>" }}
    ],
    "correctMatches": {{
      "left1": "right2",
      "left2": "right1"
    }}
  }},
  "explanation": "<p>...</p>"
}}

============================================================
CODE OUTPUT RULES
============================================================

CRITICAL RULE FOR CODE OUTPUT:
1. The "code" field MUST contain a COMPLETE, EXECUTABLE code snippet (including function calls or print/log statements) that evaluates to a explicit result.
2. DO NOT ask the user to write code in the prompt. The prompt MUST ask: "What is the output of this code?" or similar.
3. "correctAnswer" MUST be the exact printed or evaluated output string of the execution.

EXAMPLE:
{{
  "type": "code_output",
  "prompt": "<p>What is the output of the following TypeScript snippet?</p>",
  "content": {{
    "language": "typescript",
    "code": "function length(arr: number[]): number {{\n  return arr.length;\n}}\n\nconsole.log(length([10, 20, 30]));",
    "correctAnswer": "3"
  }},
  "explanation": "<p>The length method evaluates array size, which contains 3 elements.</p>"
}}

============================================================
CODE COMPLETION RULES
============================================================

CRITICAL RULE FOR CODE COMPLETION:
1. The "code" snippet MUST include a clear fill-in-the-blank placeholder such as "___" or "// TODO".
2. "correctAnswer" MUST be the missing snippet/code segment required to complete the logic.

EXAMPLE:
{{
  "type": "code_completion",
  "prompt": "<p>Complete the function body to return the length of the array.</p>",
  "content": {{
    "language": "typescript",
    "code": "function length(arr: number[]): number {{\n  return arr.___\n}}",
    "correctAnswer": "length"
  }},
  "explanation": "<p>The <code>length</code> property yields the array count.</p>"
}}

============================================================
EQUATION
============================================================

{{
  "type": "equation",
  "prompt": "<p>...</p>",
  "content": {{
    "correctAnswer": "2x + 3",
    "acceptedAnswers": ["2x + 3", "3 + 2x"]
  }},
  "explanation": "<p>...</p>"
}}

============================================================
FINAL CHECKLIST
============================================================

1. Count the items in the "questions" array.
2. Verify that there are EXACTLY {question_count} questions.
3. Ensure no trailing commas exist in JSON object keys or arrays.
4. Verify that code_output snippets ALWAYS invoke and print a value.
"#,
        topic = topic,
        subject = request.subject.trim(),
        difficulty = request.difficulty.trim(),
        question_count = question_count,
        type_list = type_list,
        instructions = request.instructions.trim(),
    ))
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
    )
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

    // Safely fetch the loaded engine thread handle from AiState
    let engine = state.get_engine()?;

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

    let (tx, rx) = oneshot::channel();

    // Spawns a dedicated OS thread with an 8MB stack to prevent 0xc0000409 stack overruns
    std::thread::Builder::new()
        .name("ai-inference".into())
        .stack_size(8 * 1024 * 1024)
        .spawn(move || {
            let res = (|| {
                let engine_guard = engine
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
                        &*engine_guard,
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

#[tauri::command]
pub async fn generate_quiz(
    request: GenerateQuizRequest,
    state: tauri::State<'_, AiState>,
) -> Result<String, String> {
    let prompt =
        build_quiz_generation_prompt(&request)?;

    let engine = state.get_engine()?;

    let (tx, rx) = oneshot::channel();

    std::thread::Builder::new()
        .name("ai-quiz-generation".into())
        .stack_size(8 * 1024 * 1024)
        .spawn(move || {
            let result = (|| {
                let engine_guard = engine
                    .lock()
                    .map_err(|_| {
                        "AI engine mutex is poisoned due to a previous panic"
                            .to_string()
                    })?;

                /*
                 * We intentionally use the same generation
                 * pipeline as ai_chat.
                 *
                 * Do NOT use clean_response() here because
                 * the HTML/LaTeX JSON structure must remain
                 * untouched.
                 */
                let raw_response =
                    generation::generate(
                        &*engine_guard,
                        &prompt,
                        language::Language::English,
                        None,
                        TaskMode::Focused,
                        None,
                    )
                    .map_err(|error| {
                        format!(
                            "Quiz generation failed: {}",
                            error
                        )
                    })?;

                let cleaned =
                    raw_response.trim();

                /*
                 * Small models sometimes still wrap JSON
                 * in Markdown fences despite the prompt.
                 *
                 * Remove only the outer fence.
                 */
                let cleaned =
                    if cleaned.starts_with(
                        "```json",
                    ) {
                        cleaned
                            .trim_start_matches(
                                "```json",
                            )
                            .trim()
                            .trim_end_matches(
                                "```",
                            )
                            .trim()
                    } else if cleaned.starts_with(
                        "```",
                    ) {
                        cleaned
                            .trim_start_matches(
                                "```",
                            )
                            .trim()
                            .trim_end_matches(
                                "```",
                            )
                            .trim()
                    } else {
                        cleaned
                    };

                /*
                 * Backend sanity check.
                 *
                 * We don't deserialize into the frontend's
                 * entire QuizQuestion schema here because
                 * the frontend owns the final validation.
                 */
                let _: serde_json::Value =
                    serde_json::from_str(cleaned)
                        .map_err(|error| {
                            format!(
                                "AI returned invalid quiz JSON: {}",
                                error
                            )
                        })?;

                Ok::<String, String>(
                    cleaned.to_string()
                )
            })();

            let _ = tx.send(result);
        })
        .map_err(|error| {
            format!(
                "Failed to spawn quiz generation thread: {}",
                error
            )
        })?;

    rx.await
        .map_err(|_| {
            "Quiz generation thread panicked."
                .to_string()
        })?
}