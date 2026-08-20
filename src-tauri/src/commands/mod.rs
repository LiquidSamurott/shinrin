// src-tauri/src/commands/mod.rs

pub mod settings;

/* ==========================================
   Command Registration
========================================== */

pub use settings::{
    get_settings,
    update_settings,
    reset_settings,
};

