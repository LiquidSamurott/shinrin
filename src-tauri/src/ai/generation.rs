use anyhow::{Context, Result};

use super::{
    engine::{AiEngine, GenerationConfig, TaskMode, DEFAULT_CONTEXT_SIZE},
    language::Language,
    prompt,
    response::clean_response,
};

const CONTEXT_SIZE: usize = DEFAULT_CONTEXT_SIZE as usize; // 16384 tokens
const MAX_NEW_TOKENS: usize = 2048;
const MAX_WEB_CONTEXT_CHARS: usize = 12000;
const BATCH_CHUNK_SIZE: usize = 512; // Strictly <= n_batch to prevent GGML_ASSERT crashes

pub fn generate(
    engine: &AiEngine,
    user_message: &str,
    language: Language,
    web_context: Option<&str>,
    mode: TaskMode,
    seed: Option<u32>,
) -> Result<String> {
    let user_message = user_message.trim();

    if user_message.is_empty() {
        anyhow::bail!("Prompt cannot be empty");
    }

    let system_prompt = prompt::system_prompt(language);
    let raw_user_prompt = prompt::prepare_user_prompt(user_message, language);

    // Disable Qwen3 internal chain-of-thought to preserve tokens
    let mut user_prompt = format!("/no_think\n{}", raw_user_prompt);

    append_web_context(&mut user_prompt, web_context);

    let formatted_prompt = engine
        .build_chat_prompt(&system_prompt, &user_prompt)
        .context("Failed to build chat prompt")?;

    let full_prompt_tokens = engine
        .tokenize(&formatted_prompt)
        .context("Failed to tokenize chat prompt")?;

    if full_prompt_tokens.is_empty() {
        anyhow::bail!("Prompt produced no tokens");
    }

    // Dynamic prompt truncation: Slices excess tokens if context limit is reached
    let max_prompt_budget = CONTEXT_SIZE.saturating_sub(MAX_NEW_TOKENS).saturating_sub(1);
    let prompt_tokens = if full_prompt_tokens.len() > max_prompt_budget {
        &full_prompt_tokens[..max_prompt_budget]
    } else {
        &full_prompt_tokens[..]
    };

    // 0-argument context allocation (uses DEFAULT_CONTEXT_SIZE internally)
    let mut context = engine
        .create_context()
        .context("Failed to create inference context")?;

    // ========================================================
    // CHUNKED PROMPT DECODING (Prevents GGML_ASSERT batch overflow)
    // ========================================================

    for (chunk_idx, chunk) in prompt_tokens.chunks(BATCH_CHUNK_SIZE).enumerate() {
        let mut prompt_batch = engine.new_batch(chunk.len());

        for (i, token) in chunk.iter().enumerate() {
            let global_idx = (chunk_idx * BATCH_CHUNK_SIZE) + i;
            let is_last = global_idx == prompt_tokens.len() - 1;

            prompt_batch
                .add(*token, global_idx as i32, &[0], is_last)
                .context("Failed to add prompt token to chunk batch")?;
        }

        context
            .decode(&mut prompt_batch)
            .context("Failed to decode prompt batch chunk")?;
    }

    // ========================================================
    // SELECT PRESET & SEED
    // ========================================================

    let mut config = match mode {
        TaskMode::Normal => GenerationConfig::normal(),
        TaskMode::Focused => GenerationConfig::focused(),
        TaskMode::Mindmap => GenerationConfig::mindmap(),
        TaskMode::Creative => GenerationConfig::creative(),
        TaskMode::Regeneration(attempt) => GenerationConfig::regeneration(attempt),
    };

    config = match seed {
        Some(s) => config.with_seed(s),
        None => config.with_random_seed(),
    };

    let mut sampler = engine.sampler(&config);

    // Limit sampler ingestion to tail tokens (prevents sampler ring-buffer overflow)
    let tail_len = config.repeat_last_n.max(128) as usize;
    let tail_start = prompt_tokens.len().saturating_sub(tail_len);
    sampler.accept_many(prompt_tokens[tail_start..].iter());

    // ========================================================
    // GENERATION LOOP
    // ========================================================

    let mut decoder = engine.create_decoder();
    let mut generated = String::new();
    let mut position = prompt_tokens.len() as i32;

    for _ in 0..MAX_NEW_TOKENS {
        let next_token = sampler.sample(&context, -1);

        if engine.is_eog(next_token) {
            break;
        }

        let piece = engine
            .token_to_text(next_token, &mut decoder)
            .context("Failed to convert token to text")?;

        generated.push_str(&piece);

        let mut batch = engine.new_batch(1);

        batch
            .add(next_token, position, &[0], true)
            .context("Failed to decode generated token")?;

        context
            .decode(&mut batch)
            .context("Failed to decode generated token")?;

        sampler.accept(next_token);

        position += 1;
    }

    let content_only = extract_after_think_block(&generated);
    let cleaned = clean_response(&content_only);

    if cleaned.trim().is_empty() {
        anyhow::bail!("Model generated an empty response (tokens exhausted during thinking)");
    }

    Ok(cleaned)
}

fn append_web_context(user_prompt: &mut String, web_context: Option<&str>) {
    let Some(web_context) = web_context else {
        return;
    };

    let web_context = web_context.trim();

    if web_context.is_empty() {
        return;
    }

    let limited = web_context
        .chars()
        .take(MAX_WEB_CONTEXT_CHARS)
        .collect::<String>();

    user_prompt.push_str("\n\n--- WEB SEARCH CONTEXT ---\n\n");
    user_prompt.push_str(&limited);
    user_prompt.push_str(
        "\n\n--- END WEB SEARCH CONTEXT ---\n\n\
        Use this information when relevant. \
        Treat it as reference material rather \
        than unquestionable truth. \
        Do not invent facts unsupported by \
        the available information.",
    );
}

fn extract_after_think_block(input: &str) -> String {
    if let Some(pos) = input.rfind("</think>") {
        input[pos + 8..].to_string()
    } else if input.contains("<think>") {
        "".to_string()
    } else {
        input.to_string()
    }
}