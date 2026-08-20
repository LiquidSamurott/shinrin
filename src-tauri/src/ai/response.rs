pub fn clean_response(response: &str) -> String {
    let mut result = response.to_string();

    while let Some(start) = result.find("<think>") {
        let content_start = start + "<think>".len();

        let Some(end_relative) = result[content_start..].find("</think>") else {
            result.truncate(start);
            break;
        };

        let end = content_start + end_relative + "</think>".len();

        result.replace_range(start..end, "");
    }

    result = result
        .replace("<think>", "")
        .replace("</think>", "")
        .replace("<|think|>", "")
        .replace("<|/think|>", "")
        .replace("/no_think", "")
        .replace("<|assistant|>", "")
        .replace("<|user|>", "")
        .replace("<|system|>", "")
        .replace("<|im_start|>", "")
        .replace("<|im_end|>", "");

    let prefixes = [
        "Okay, let's see...",
        "Okay, let's see.",
        "Let's see...",
        "Let's see.",
        "Let me think...",
        "I need to determine...",
        "I should determine...",
        "We need to determine...",
        "Analyzing the question...",
        "考えてみましょう。",
        "まず考えてみましょう。",
    ];

    for prefix in prefixes {
        if result.starts_with(prefix) {
            result = result[prefix.len()..].trim_start().to_string();
        }
    }

    result.trim().to_string()
}
