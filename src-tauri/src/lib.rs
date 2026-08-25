use tauri_plugin_sql::{Migration, MigrationKind};

mod ai;
mod ai_state;
mod stt;

use ai::{ai_chat, test_searxng_connection, test_searxng_search, AiEngine};
use ai_state::AiState;
use stt::SttEngine;

use std::sync::{Arc, Mutex};

// STT Wrapper State to handle optional/missing models safely
pub struct SttState(pub Option<Arc<SttEngine>>);

// STT commands
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

    // Offload CPU-heavy C++/Whisper inference away from Tauri's UI thread
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // ============================================================
    // LOAD AI MODEL
    // ============================================================

    let engine = AiEngine::load("models/Qwen3-4B-Q6_K.gguf").expect("Failed to load AI model");
    println!("AI model loaded: {}", engine.model_path().display());

    // ============================================================
    // LOAD STT MODEL
    // ============================================================

    // Note: English-only model "ggml-small.en.bin" runs significantly faster
    let stt_model_path = "models/ggml-small.bin";
    let stt_engine = match SttEngine::new(stt_model_path) {
        Ok(engine) => {
            println!("STT model loaded: {}", stt_model_path);
            Some(Arc::new(engine))
        }
        Err(e) => {
            eprintln!("Failed to load STT model: {}", e);
            eprintln!("Continuing without STT support...");
            None
        }
    };

    // ============================================================
    // TAURI
    // ============================================================

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // ========================================================
        // AI STATE
        // ========================================================
        .manage(AiState {
            engine: Arc::new(Mutex::new(engine)),
        })
        // ========================================================
        // STT STATE
        // ========================================================
        .manage(SttState(stt_engine))
        // ========================================================
        // FILESYSTEM
        // ========================================================
        .plugin(tauri_plugin_fs::init())
        // ========================================================
        // NOTIFICATIONS
        // ========================================================
        .plugin(tauri_plugin_notification::init())
        // ========================================================
        // DATABASE
        // ========================================================
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
                    ],
                )
                .build(),
        )
        // ========================================================
        // OPENER
        // ========================================================
        .plugin(tauri_plugin_opener::init())
        // ========================================================
        // COMMANDS
        // ========================================================
        .invoke_handler(tauri::generate_handler![
            ai_chat,
            test_searxng_connection,
            test_searxng_search,
            stt_start_recording,
            stt_stop_recording,
            stt_is_available,
        ])
        // ========================================================
        // RUN
        // ========================================================
        .run(tauri::generate_context!())
        .expect("error while running Shinrin");
}