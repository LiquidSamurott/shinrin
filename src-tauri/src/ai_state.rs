use crate::ai::AiEngine;
use std::sync::Arc;
use std::sync::Mutex;

pub struct AiState {
    pub engine: Arc<Mutex<AiEngine>>,
}
