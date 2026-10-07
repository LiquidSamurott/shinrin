use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::Emitter;

mod ai;
mod ai_state;
mod stt;

use ai::{ai_chat, test_searxng_connection, test_searxng_search, AiEngine, generate_quiz};
use ai_state::AiState;
use stt::SttEngine;

use std::sync::Arc;

// STT Wrapper State to handle optional/missing models safely
pub struct SttState(pub Option<Arc<SttEngine>>);

// ============================================================
// HELPER: Find Model Files
// ============================================================

fn find_model_file(app: &tauri::AppHandle, model_name: &str) -> Result<std::path::PathBuf, String> {
    // 1. Check bundled resources first (for small models)
    let resource_path = app
        .path()
        .resolve(format!("models/{}", model_name), BaseDirectory::Resource);
    
    if let Ok(path) = resource_path {
        if path.exists() {
            return Ok(path);
        }
    }
    
    // 2. Check app data directory (for downloaded models)
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let data_path = app_data_dir.join("models").join(model_name);
    if data_path.exists() {
        return Ok(data_path);
    }
    
    // 3. Check current directory (for development)
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    let dev_path = current_dir.join("models").join(model_name);
    if dev_path.exists() {
        return Ok(dev_path);
    }
    
    Err(format!("Model not found: {}", model_name))
}

// ============================================================
// MODEL MANAGEMENT COMMANDS
// ============================================================

#[tauri::command]
async fn download_model(
    app: tauri::AppHandle,
    model_name: String,
    download_url: String,
    window: tauri::Window,
) -> Result<String, String> {
    use std::fs::File;
    use std::io::Write;
    use reqwest::Client;
    use futures_util::StreamExt;
    
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let models_dir = app_data_dir.join("models");
    std::fs::create_dir_all(&models_dir).map_err(|e| e.to_string())?;
    
    let model_path = models_dir.join(&model_name);
    
    if model_path.exists() {
        return Ok(model_path.to_string_lossy().to_string());
    }
    
    let client = Client::new();
    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let total_size = response.content_length().unwrap_or(0);
    let mut file = File::create(&model_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        let percentage = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            0.0
        };
        
        let _ = window.emit("download_progress", serde_json::json!({
            "total": total_size,
            "downloaded": downloaded,
            "percentage": percentage,
            "status": format!("Downloading {}...", model_name)
        }));
    }
    
    Ok(model_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_available_models(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let models_dir = app_data_dir.join("models");
    
    if !models_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut models = Vec::new();
    for entry in std::fs::read_dir(models_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().map_or(false, |ext| ext == "gguf" || ext == "bin") {
            models.push(path.file_name().unwrap().to_string_lossy().to_string());
        }
    }
    
    Ok(models)
}

#[tauri::command]
fn delete_model(app: tauri::AppHandle, model_name: String) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let model_path = app_data_dir.join("models").join(&model_name);
    
    if model_path.exists() {
        std::fs::remove_file(model_path).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn get_model_info(app: tauri::AppHandle, model_name: String) -> Result<serde_json::Value, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let model_path = app_data_dir.join("models").join(&model_name);
    
    if !model_path.exists() {
        return Err("Model not found".to_string());
    }
    
    let metadata = std::fs::metadata(&model_path).map_err(|e| e.to_string())?;
    let size_mb = metadata.len() as f64 / (1024.0 * 1024.0);
    
    Ok(serde_json::json!({
        "name": model_name,
        "path": model_path.to_string_lossy(),
        "size_bytes": metadata.len(),
        "size_mb": format!("{:.2} MB", size_mb),
        "modified": metadata.modified().ok().map(|t| format!("{:?}", t)),
    }))
}

#[tauri::command]
async fn load_active_model(
    app: tauri::AppHandle,
    model_name: String,
    state: tauri::State<'_, AiState>,
) -> Result<String, String> {
    let model_path = find_model_file(&app, &model_name)?;

    let path_str = model_path
        .to_str()
        .ok_or_else(|| "Invalid model path UTF-8 encoding".to_string())?
        .to_string();

    let new_engine = tauri::async_runtime::spawn_blocking(move || {
        AiEngine::load(&path_str)
    })
    .await
    .map_err(|e| format!("Failed execution during model load: {}", e))?
    .map_err(|e| format!("Failed to load model '{}': {}", model_name, e))?;

    state.set_engine(Some(new_engine))?;

    Ok(format!("Successfully loaded model '{}'", model_name))
}

// ============================================================
// STT COMMANDS
// ============================================================

#[tauri::command]
fn stt_start_recording(stt_state: tauri::State<'_, SttState>) -> Result<(), String> {
    match &stt_state.0 {
        Some(engine) => engine.start_recording().map_err(|e| e.to_string()),
        None => Err("STT engine is not loaded".to_string()),
    }
}

#[tauri::command]
async fn stt_stop_recording(stt_state: tauri::State<'_, SttState>) -> Result<String, String> {
    let engine = stt_state
        .0
        .clone()
        .ok_or_else(|| "STT engine is not loaded".to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        engine.stop_recording().map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("Thread task execution failed: {}", e))?
}

#[tauri::command]
fn stt_is_available(stt_state: tauri::State<'_, SttState>) -> bool {
    stt_state
        .0
        .as_ref()
        .map(|engine| engine.is_model_available())
        .unwrap_or(false)
}

// ============================================================
// MAIN
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:shinrin.db",
                    vec![
                        Migration {
                            version: 1,
                            description: "Initial Shinrin schema",
                            sql: include_str!("../migrations/0001_initial.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 2,
                            description: "Flashcards",
                            sql: include_str!("../migrations/0002_flashcards.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 3,
                            description: "Pomodoro",
                            sql: include_str!("../migrations/0003_pomodoro.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 4,
                            description: "Calendar",
                            sql: include_str!("../migrations/0004_calendar.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 5,
                            description: "Application settings",
                            sql: include_str!("../migrations/0005_settings.sql"),
                            kind: MigrationKind::Up,
                        },
                         Migration {
                            version: 6,
                            description: "Quizzes",
                            sql: include_str!("../migrations/0006_quizzes.sql"),
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            ai_chat,
            generate_quiz,
            test_searxng_connection,
            test_searxng_search,
            stt_start_recording,
            stt_stop_recording,
            stt_is_available,
            download_model,
            get_available_models,
            delete_model,
            get_model_info,
            load_active_model,
        ])
        .setup(|app| {
            let handle = app.handle();

            // ============================================================
            // LOAD AI MODEL (Non-blocking on failure)
            // ============================================================
            let ai_model_name = "Qwen3.5-0.8B-UD-Q8_K_XL.gguf";
            let ai_engine = match find_model_file(handle, ai_model_name) {
                Ok(path) => match AiEngine::load(path.to_str().unwrap()) {
                    Ok(engine) => Some(engine),
                    Err(e) => {
                        eprintln!("Failed to load AI model '{}': {}", ai_model_name, e);
                        None
                    }
                },
                Err(e) => {
                    eprintln!("AI model file not found: {}", e);
                    None
                }
            };

            // ============================================================
            // LOAD STT MODEL
            // ============================================================
            let stt_model_name = "ggml-small.bin";
            let stt_engine = match find_model_file(handle, stt_model_name) {
                Ok(path) => match SttEngine::new(path.to_str().unwrap()) {
                    Ok(engine) => Some(Arc::new(engine)),
                    Err(e) => {
                        eprintln!("Failed to load STT model: {}", e);
                        None
                    }
                },
                Err(e) => {
                    eprintln!("Failed to find STT model: {}", e);
                    None
                }
            };

            // ============================================================
            // MANAGE STATE ON APP
            // ============================================================
            app.manage(AiState::new(ai_engine));
            app.manage(SttState(stt_engine));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Shinrin application");
}