use crate::ai::language::{detect_language, Language};

#[derive(Debug, Clone, Default)]
pub struct QualityReport {
    pub issues: Vec<String>,
}

impl QualityReport {
    pub fn is_acceptable(&self) -> bool {
        self.issues.is_empty()
    }

    pub fn needs_regeneration(&self) -> bool {
        !self.is_acceptable()
    }
}

pub fn evaluate(response: &str, expected_language: Language) -> QualityReport {
    let mut issues = Vec::new();
    let trimmed = response.trim();

    if trimmed.is_empty() {
        issues.push("Response is empty".to_string());

        return QualityReport { issues };
    }

    if trimmed.chars().count() < 3 {
        issues.push("Response is too short".to_string());
    }

    if contains_thinking_markers(trimmed) {
        issues.push("Internal reasoning markers detected".to_string());
    }

    if contains_control_tokens(trimmed) {
        issues.push("Model control tokens leaked into response".to_string());
    }

    if contains_suspicious_prefix(trimmed) {
        issues.push("Reasoning-style prefix detected".to_string());
    }

    if expected_language != Language::Unknown {
        let detected = detect_language(trimmed);

        let mismatch = is_definite_script_mismatch(expected_language, detected);

        if mismatch {
            issues.push(format!(
                "Language mismatch (expected {}, detected {})",
                expected_language, detected,
            ));
        }
    }

    QualityReport { issues }
}

// ============================================================
// LANGUAGE MISMATCH
// ============================================================

fn is_definite_script_mismatch(expected: Language, detected: Language) -> bool {
    match expected {
        Language::Japanese => detected == Language::Korean || detected == Language::Chinese,

        Language::Korean => detected == Language::Japanese || detected == Language::Chinese,

        Language::Chinese => detected == Language::Japanese || detected == Language::Korean,

        Language::English
        | Language::Indonesian
        | Language::Spanish
        | Language::French
        | Language::German
        | Language::Portuguese
        | Language::Unknown => false,
    }
}

// ============================================================
// THINKING MARKERS
// ============================================================

fn contains_thinking_markers(text: &str) -> bool {
    let lower = text.to_lowercase();

    lower.contains("<think>")
        || lower.contains("</think>")
        || lower.contains("<|think|>")
        || lower.contains("<|/think|>")
        || lower.contains("/no_think")
}

// ============================================================
// CONTROL TOKENS
// ============================================================

fn contains_control_tokens(text: &str) -> bool {
    const TOKENS: &[&str] = &[
        "<|assistant|>",
        "<|user|>",
        "<|system|>",
        "<|im_start|>",
        "<|im_end|>",
        "<|begin_of_text|>",
        "<|end_of_text|>",
        "<|endoftext|>",
        "<|eot_id|>",
        "<|start_header_id|>",
        "<|end_header_id|>",
    ];

    TOKENS.iter().any(|token| text.contains(token))
}

// ============================================================
// SUSPICIOUS PREFIXES
// ============================================================

fn contains_suspicious_prefix(text: &str) -> bool {
    let text = text.trim_start();

    const PREFIXES: &[&str] = &[
        "Okay, let's see",
        "Okay, let me see",
        "Let's see",
        "Let me think",
        "I need to determine",
        "I should determine",
        "First, I should",
        "We need to determine",
        "Analyzing the question",
        "Let's analyze",
        "I need to analyze",
        "First let's analyze",
        "Mari kita lihat",
        "Mari kita analisis",
        "Pertama, kita perlu",
        "Saya perlu menentukan",
        "考えてみましょう",
        "まず考えてみましょう",
        "分析してみましょう",
        "まず分析します",
        "생각해 봅시다",
        "먼저 생각해 보겠습니다",
        "분석해 보겠습니다",
        "让我们看看",
        "首先我们需要",
        "分析一下",
        "Veamos",
        "Analicemos",
        "Voyons",
        "Analysons",
        "Schauen wir",
        "Analysieren wir",
        "Vamos ver",
        "Vamos analisar",
    ];

    PREFIXES.iter().any(|prefix| text.starts_with(prefix))
}
