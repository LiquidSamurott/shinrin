use anyhow::{Context, Result};
use encoding_rs::UTF_8;
use llama_cpp_2::{
    context::{params::LlamaContextParams, LlamaContext},
    llama_backend::LlamaBackend,
    llama_batch::LlamaBatch,
    model::{
        params::LlamaModelParams,
        AddBos,
        LlamaChatMessage,
        LlamaModel,
    },
    sampling::LlamaSampler,
    token::LlamaToken,
};

use rand::random;

use std::{
    num::{NonZeroU16, NonZeroU32},
    path::{Path, PathBuf},
};

// Exported constant required by generation.rs
pub const DEFAULT_CONTEXT_SIZE: u32 = 16384;

/*
============================================================
TASK MODE
============================================================
*/

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskMode {
    Normal,
    Focused,
    Mindmap,
    Creative,
    Regeneration(usize),
}

impl Default for TaskMode {
    fn default() -> Self {
        Self::Normal
    }
}

/*
============================================================
GENERATION CONFIG
============================================================
*/

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct GenerationConfig {
    pub temperature: f32,
    pub top_p: f32,
    pub top_k: i32,
    pub repeat_penalty: f32,
    pub repeat_last_n: i32,
    pub max_tokens: Option<usize>,
    pub seed: Option<u32>,
}

impl Default for GenerationConfig {
    fn default() -> Self {
        Self {
            temperature: 0.70,
            top_p: 0.90,
            top_k: 40,
            repeat_penalty: 1.10,
            repeat_last_n: 128,
            max_tokens: None,
            seed: None,
        }
    }
}

/*
============================================================
PRESETS & BUILDERS
============================================================
*/

#[allow(dead_code)]
impl GenerationConfig {
    pub fn normal() -> Self {
        Self::default()
    }

    pub fn focused() -> Self {
        Self {
            temperature: 0.30,
            top_p: 0.85,
            top_k: 30,
            repeat_penalty: 1.08,
            repeat_last_n: 128,
            max_tokens: None,
            seed: None,
        }
    }

    pub fn mindmap() -> Self {
        Self {
            temperature: 0.40,
            top_p: 0.90,
            top_k: 40,
            repeat_penalty: 1.12,
            repeat_last_n: 128,
            max_tokens: None,
            seed: None,
        }
    }

    pub fn creative() -> Self {
        Self {
            temperature: 0.90,
            top_p: 0.95,
            top_k: 50,
            repeat_penalty: 1.12,
            repeat_last_n: 128,
            max_tokens: None,
            seed: None,
        }
    }

    pub fn regeneration(attempt: usize) -> Self {
        match attempt {
            1 => Self {
                temperature: 0.75,
                top_p: 0.92,
                top_k: 45,
                repeat_penalty: 1.12,
                repeat_last_n: 128,
                max_tokens: None,
                seed: None,
            },
            2 => Self {
                temperature: 0.85,
                top_p: 0.95,
                top_k: 50,
                repeat_penalty: 1.15,
                repeat_last_n: 160,
                max_tokens: None,
                seed: None,
            },
            _ => Self {
                temperature: 0.95,
                top_p: 0.97,
                top_k: 60,
                repeat_penalty: 1.18,
                repeat_last_n: 192,
                max_tokens: None,
                seed: None,
            },
        }
    }

    pub fn with_max_tokens(mut self, max_tokens: usize) -> Self {
        self.max_tokens = Some(max_tokens);
        self
    }

    pub fn max_tokens(&self) -> Option<usize> {
        self.max_tokens
    }

    pub fn with_random_seed(mut self) -> Self {
        self.seed = Some(random::<u32>());
        self
    }

    pub fn with_seed(mut self, seed: u32) -> Self {
        self.seed = Some(seed);
        self
    }
}

/*
============================================================
AI ENGINE
============================================================
*/

pub struct AiEngine {
    backend: LlamaBackend,
    model: LlamaModel,
    model_path: PathBuf,
}

impl AiEngine {
    pub fn load<P: AsRef<Path>>(model_path: P) -> Result<Self> {
        let model_path = model_path.as_ref().to_path_buf();

        if !model_path.exists() {
            anyhow::bail!("GGUF model not found: {}", model_path.display());
        }

        if model_path.extension().and_then(|x| x.to_str()) != Some("gguf") {
            anyhow::bail!("Expected a .gguf model file, got: {}", model_path.display());
        }

        println!("Loading AI model: {}", model_path.display());

        let backend = LlamaBackend::init()
            .context("Failed to initialize llama.cpp backend")?;

        let model_params = LlamaModelParams::default();

        let model = LlamaModel::load_from_file(&backend, &model_path, &model_params)
            .context("Failed to load GGUF model")?;

        println!("AI model loaded successfully");

        Ok(Self {
            backend,
            model,
            model_path,
        })
    }

    pub fn model_path(&self) -> &Path {
        &self.model_path
    }

    /// Primary 0-argument context creator using DEFAULT_CONTEXT_SIZE
    pub fn create_context(&self) -> Result<LlamaContext<'_>> {
        self.create_context_with_size(DEFAULT_CONTEXT_SIZE)
    }

    /// Parameterized helper for custom context allocations
    pub fn create_context_with_size(&self, size: u32) -> Result<LlamaContext<'_>> {
        let context_size = NonZeroU32::new(size)
            .ok_or_else(|| anyhow::anyhow!("Context size must be non-zero"))?;

        // Keep batch size to 2048 to allow chunked decoding up to 512 tokens safely
        let params = LlamaContextParams::default()
            .with_n_ctx(Some(context_size))
            .with_n_batch(2048);

        self.model
            .new_context(&self.backend, params)
            .context("Failed to create llama.cpp context")
    }

    pub fn tokenize(&self, text: &str) -> Result<Vec<LlamaToken>> {
        self.model
            .str_to_token(text, AddBos::Never)
            .context("Failed to tokenize prompt")
    }

    pub fn build_chat_prompt(&self, system_prompt: &str, user_prompt: &str) -> Result<String> {
        let template = self
            .model
            .chat_template(None)
            .context("Model does not contain a chat template")?;

        let messages = vec![
            LlamaChatMessage::new("system".to_string(), system_prompt.to_string())
                .context("Failed to create system message")?,
            LlamaChatMessage::new("user".to_string(), user_prompt.to_string())
                .context("Failed to create user message")?,
        ];

        self.model
            .apply_chat_template(&template, &messages, true)
            .context("Failed to apply chat template")
    }

    pub fn create_decoder(&self) -> encoding_rs::Decoder {
        UTF_8.new_decoder()
    }

    pub fn token_to_text(
        &self,
        token: LlamaToken,
        decoder: &mut encoding_rs::Decoder,
    ) -> Result<String> {
        self.model
            .token_to_piece(
                token,
                decoder,
                false,
                None::<NonZeroU16>,
            )
            .context("Failed to convert token to text")
    }

    pub fn is_eog(&self, token: LlamaToken) -> bool {
        self.model.is_eog_token(token)
    }

    pub fn sampler(&self, config: &GenerationConfig) -> LlamaSampler {
        let seed = config.seed.unwrap_or_else(random::<u32>);

        println!("AI sampler seed: {}", seed);

        LlamaSampler::chain_simple([
            LlamaSampler::penalties(
                config.repeat_last_n,
                config.repeat_penalty,
                0.0,
                0.0,
            ),
            LlamaSampler::top_k(config.top_k),
            LlamaSampler::top_p(config.top_p, 1),
            LlamaSampler::temp(config.temperature),
            LlamaSampler::dist(seed),
        ])
    }

    pub fn new_batch(&self, size: usize) -> LlamaBatch<'_> {
        LlamaBatch::new(size, 1)
    }
}