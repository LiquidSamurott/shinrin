use std::sync::{Arc, Mutex};
use crate::ai::AiEngine;

pub struct AiState {
    pub engine: Mutex<Option<Arc<Mutex<AiEngine>>>>,
}

impl AiState {
    pub fn new(engine: Option<AiEngine>) -> Self {
        Self {
            engine: Mutex::new(engine.map(|e| Arc::new(Mutex::new(e)))),
        }
    }

    pub fn get_engine(&self) -> Result<Arc<Mutex<AiEngine>>, String> {
        let guard = self.engine.lock().map_err(|_| "Failed to lock AiState")?;
        guard
            .clone()
            .ok_or_else(|| "AI model is not loaded. Please download or select a model.".to_string())
    }

    pub fn set_engine(&self, engine: Option<AiEngine>) -> Result<(), String> {
        let mut guard = self.engine.lock().map_err(|_| "Failed to lock AiState")?;
        *guard = engine.map(|e| Arc::new(Mutex::new(e)));
        Ok(())
    }
}