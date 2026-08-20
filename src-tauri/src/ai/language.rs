use std::fmt;
use std::str::FromStr;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Language {
    English,
    Indonesian,
    Japanese,
    Korean,
    Chinese,
    Spanish,
    French,
    German,
    Portuguese,
    Unknown,
}

impl Language {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::English => "English",
            Self::Indonesian => "Indonesian",
            Self::Japanese => "Japanese",
            Self::Korean => "Korean",
            Self::Chinese => "Chinese",
            Self::Spanish => "Spanish",
            Self::French => "French",
            Self::German => "German",
            Self::Portuguese => "Portuguese",
            Self::Unknown => "Unknown",
        }
    }

    pub fn code(&self) -> &'static str {
        match self {
            Self::English => "en",
            Self::Indonesian => "id",
            Self::Japanese => "ja",
            Self::Korean => "ko",
            Self::Chinese => "zh",
            Self::Spanish => "es",
            Self::French => "fr",
            Self::German => "de",
            Self::Portuguese => "pt",
            Self::Unknown => "unknown",
        }
    }
}

impl fmt::Display for Language {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for Language {
    type Err = ();

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim().to_lowercase().as_str() {
            "english" | "en" => Ok(Self::English),
            "indonesian" | "id" => Ok(Self::Indonesian),
            "japanese" | "ja" => Ok(Self::Japanese),
            "korean" | "ko" => Ok(Self::Korean),
            "chinese" | "zh" => Ok(Self::Chinese),
            "spanish" | "es" => Ok(Self::Spanish),
            "french" | "fr" => Ok(Self::French),
            "german" | "de" => Ok(Self::German),
            "portuguese" | "pt" => Ok(Self::Portuguese),
            "unknown" => Ok(Self::Unknown),
            _ => Err(()),
        }
    }
}

// ============================================================
// LANGUAGE DETECTION
// ============================================================

pub fn detect_language(text: &str) -> Language {
    let mut japanese = false;
    let mut korean = false;
    let mut chinese = false;

    let mut german = false;
    let mut spanish = false;
    let mut french = false;
    let mut latin = false;

    for character in text.chars() {
        if is_japanese_character(character) {
            japanese = true;
            continue;
        }

        if is_korean_character(character) {
            korean = true;
            continue;
        }

        if is_chinese_character(character) {
            chinese = true;
            continue;
        }

        if character == 'ß' || character == 'ẞ' {
            german = true;
            continue;
        }

        if character == 'ñ' || character == 'Ñ' || character == '¿' || character == '¡' {
            spanish = true;
            continue;
        }

        if character == 'à'
            || character == 'â'
            || character == 'é'
            || character == 'è'
            || character == 'ê'
            || character == 'ë'
            || character == 'î'
            || character == 'ï'
            || character == 'ô'
            || character == 'ù'
            || character == 'û'
            || character == 'ü'
            || character == 'ç'
            || character == 'Ç'
        {
            french = true;
            continue;
        }

        if character.is_alphabetic() {
            latin = true;
        }
    }

    if japanese {
        return Language::Japanese;
    }

    if korean {
        return Language::Korean;
    }

    if chinese {
        return Language::Chinese;
    }

    if german {
        return Language::German;
    }

    if spanish {
        return Language::Spanish;
    }

    if french {
        return Language::French;
    }

    if latin {
        let lower = text.to_lowercase();

        if contains_any_word(
            &lower,
            &[
                "yang", "dan", "dengan", "adalah", "untuk", "dari", "ini", "itu", "tidak", "akan",
            ],
        ) {
            return Language::Indonesian;
        }

        return Language::English;
    }

    Language::Unknown
}

// ============================================================
// CHARACTER HELPERS
// ============================================================

fn is_japanese_character(character: char) -> bool {
    if character >= '\u{3040}' && character <= '\u{309F}' {
        return true;
    }

    if character >= '\u{30A0}' && character <= '\u{30FF}' {
        return true;
    }

    if character >= '\u{FF66}' && character <= '\u{FF9F}' {
        return true;
    }

    false
}

fn is_korean_character(character: char) -> bool {
    if character >= '\u{AC00}' && character <= '\u{D7AF}' {
        return true;
    }

    if character >= '\u{1100}' && character <= '\u{11FF}' {
        return true;
    }

    if character >= '\u{3130}' && character <= '\u{318F}' {
        return true;
    }

    false
}

fn is_chinese_character(character: char) -> bool {
    if character >= '\u{3400}' && character <= '\u{4DBF}' {
        return true;
    }

    if character >= '\u{4E00}' && character <= '\u{9FFF}' {
        return true;
    }

    if character >= '\u{F900}' && character <= '\u{FAFF}' {
        return true;
    }

    false
}

fn contains_any_word(text: &str, words: &[&str]) -> bool {
    for word in words {
        if text.split_whitespace().any(|candidate| candidate == *word) {
            return true;
        }
    }

    false
}

// ============================================================
// TESTS
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_english() {
        assert_eq!(detect_language("Hello, how are you?"), Language::English);
    }

    #[test]
    fn detects_indonesian() {
        assert_eq!(
            detect_language("Selamat pagi, bagaimana kabarmu?"),
            Language::Indonesian
        );
    }

    #[test]
    fn detects_japanese() {
        assert_eq!(
            detect_language("こんにちは、お元気ですか？"),
            Language::Japanese
        );
    }

    #[test]
    fn detects_korean() {
        assert_eq!(detect_language("안녕하세요"), Language::Korean);
    }

    #[test]
    fn detects_chinese() {
        assert_eq!(detect_language("你好，你好吗？"), Language::Chinese);
    }

    #[test]
    fn detects_german() {
        assert_eq!(detect_language("Straßenbahn"), Language::German);
    }

    #[test]
    fn detects_spanish() {
        assert_eq!(detect_language("¿Cómo estás?"), Language::Spanish);
    }

    #[test]
    fn detects_unknown() {
        assert_eq!(detect_language("12345 !@#$"), Language::Unknown);
    }
}
