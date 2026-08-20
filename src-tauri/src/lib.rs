use tauri_plugin_sql::{Migration, MigrationKind};

mod ai;
mod ai_state;

use ai::{ai_chat, test_searxng_connection, test_searxng_search, AiEngine};

use ai_state::AiState;

use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // ============================================================
    // LOAD AI MODEL
    // ============================================================

    let engine = AiEngine::load("models/Qwen3-4B-Q6_K.gguf").expect("Failed to load AI model");

    println!("AI model loaded: {}", engine.model_path().display());

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
        ])
        // ========================================================
        // RUN
        // ========================================================
        .run(tauri::generate_context!())
        .expect("error while running Shinrin");
}
