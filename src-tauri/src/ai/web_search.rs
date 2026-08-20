use anyhow::{Context, Result};
use rand::Rng;
use reqwest::{
    header::{HeaderMap, ACCEPT, ACCEPT_LANGUAGE, CONTENT_TYPE, RETRY_AFTER, USER_AGENT},
    Client,
};
use serde::Deserialize;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};
use tokio::time::sleep;

use super::language::Language;

/*
============================================================
CONFIGURATION
============================================================
*/

const MAX_RETRIES: usize = 3;
const INITIAL_BACKOFF_MS: u64 = 1_000;
const MAX_BACKOFF_SECONDS: u64 = 30;

const CACHE_TTL_SECONDS: u64 = 60;
const MAX_CACHE_ENTRIES: usize = 50;

const MAX_BODY_PREVIEW_CHARS: usize = 800;

/*
============================================================
SEARCH RESULT
============================================================
*/

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

/*
============================================================
CACHE ENTRY
============================================================
*/

#[derive(Debug, Clone)]
struct CacheEntry {
    created_at: Instant,
    results: Vec<SearchResult>,
}

/*
============================================================
SEARXNG RESPONSE
============================================================
*/

#[derive(Debug, Deserialize)]
struct SearxResponse {
    #[serde(default)]
    results: Vec<SearxResult>,
}

#[derive(Debug, Deserialize)]
struct SearxResult {
    #[serde(default)]
    title: String,

    #[serde(default)]
    url: String,

    #[serde(default)]
    content: String,
}

/*
============================================================
WEB SEARCH
============================================================
*/

#[derive(Clone)]
pub struct WebSearch {
    client: Client,
    base_url: String,

    cache: Arc<Mutex<HashMap<String, CacheEntry>>>,
}

/*
============================================================
IMPLEMENTATION
============================================================
*/

impl WebSearch {
    /*
    ============================================================
    CREATE CLIENT
    ============================================================
    */

    pub fn new(base_url: impl Into<String>) -> Result<Self> {
        let base_url = base_url.into().trim().trim_end_matches('/').to_string();

        /*
        --------------------------------------------------------
        Validate URL
        --------------------------------------------------------
        */

        if base_url.is_empty() {
            anyhow::bail!("SearXNG URL is not configured");
        }

        let parsed_url = reqwest::Url::parse(&base_url)
            .with_context(|| format!("Invalid SearXNG URL '{}'", base_url))?;

        match parsed_url.scheme() {
            "http" | "https" => {}

            scheme => {
                anyhow::bail!(
                    "Invalid SearXNG URL '{}'. \
                     Unsupported protocol '{}'. \
                     URL must use http:// or https://",
                    base_url,
                    scheme
                );
            }
        }

        if parsed_url.host_str().is_none() {
            anyhow::bail!("SearXNG URL must contain a hostname");
        }

        /*
        --------------------------------------------------------
        Headers
        --------------------------------------------------------
        */

        let mut headers = HeaderMap::new();

        headers.insert(
            ACCEPT,
            "application/json,text/html;q=0.9,*/*;q=0.8"
                .parse()
                .context("Failed to configure Accept header")?,
        );

        headers.insert(
            ACCEPT_LANGUAGE,
            "en-US,en;q=0.9"
                .parse()
                .context("Failed to configure Accept-Language header")?,
        );

        headers.insert(
            USER_AGENT,
            "Shinrin/1.0"
                .parse()
                .context("Failed to configure User-Agent header")?,
        );

        /*
        --------------------------------------------------------
        HTTP CLIENT
        --------------------------------------------------------
        */

        let client = Client::builder()
            .default_headers(headers)
            .connect_timeout(Duration::from_secs(10))
            .timeout(Duration::from_secs(30))
            .build()
            .context("Failed to create SearXNG HTTP client")?;

        /*
        --------------------------------------------------------
        CACHE
        --------------------------------------------------------
        */

        let cache = Arc::new(Mutex::new(HashMap::new()));

        Ok(Self {
            client,
            base_url,
            cache,
        })
    }

    /*
    ============================================================
    BODY PREVIEW
    ============================================================
    */

    fn preview_body(body: &str) -> String {
        body.chars()
            .take(MAX_BODY_PREVIEW_CHARS)
            .collect::<String>()
            .replace('\n', " ")
            .replace('\r', " ")
    }

    /*
    ============================================================
    TEST SERVER CONNECTION
    ============================================================
    */

    pub async fn test_connection(&self) -> Result<()> {
        println!("Testing SearXNG server: {}", self.base_url);

        /*
        --------------------------------------------------------
        ROOT SERVER
        --------------------------------------------------------
        */

        let response = self
            .client
            .get(&self.base_url)
            .send()
            .await
            .with_context(|| format!("Failed to contact SearXNG at {}", self.base_url))?;

        let status = response.status();

        println!("SearXNG root response: HTTP {}", status);

        /*
        --------------------------------------------------------
        429
        --------------------------------------------------------
        */

        if status.as_u16() == 429 {
            let retry_after = retry_after_seconds(&response);

            anyhow::bail!(
                "SearXNG server is rate limiting \
                 Shinrin (HTTP 429). Retry-After: {}",
                format_retry_after(retry_after)
            );
        }

        /*
        --------------------------------------------------------
        403
        --------------------------------------------------------
        */

        if status.as_u16() == 403 {
            let body = response.text().await.unwrap_or_default();

            anyhow::bail!(
                "SearXNG server returned HTTP 403 Forbidden. \
                 Response: {}",
                Self::preview_body(&body)
            );
        }

        /*
        --------------------------------------------------------
        OTHER ERRORS
        --------------------------------------------------------
        */

        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();

            anyhow::bail!(
                "SearXNG server returned HTTP {} {}. \
                 Response: {}",
                status.as_u16(),
                status.canonical_reason().unwrap_or(""),
                Self::preview_body(&body)
            );
        }

        println!("SearXNG server is reachable");

        /*
        --------------------------------------------------------
        SEARCH API
        --------------------------------------------------------
        */

        self.test_search().await?;

        Ok(())
    }

    /*
    ============================================================
    TEST SEARCH API
    ============================================================
    */

    pub async fn test_search(&self) -> Result<()> {
        let endpoint = format!("{}/search", self.base_url);

        println!("Testing SearXNG search API: {}", endpoint);

        /*
        --------------------------------------------------------
        IMPORTANT
        --------------------------------------------------------

        Use owned Strings here.

        This avoids lifetime/type problems when constructing
        query parameters.
        --------------------------------------------------------
        */

        let query_params = vec![
            ("q".to_string(), "test".to_string()),
            ("format".to_string(), "json".to_string()),
            ("language".to_string(), "en".to_string()),
            ("safesearch".to_string(), "2".to_string()),
            ("categories".to_string(), "general".to_string()),
        ];

        let response = self.request_with_backoff(&endpoint, &query_params).await?;

        let body = read_and_validate_json_response(response).await?;

        let data = serde_json::from_str::<SearxResponse>(&body).with_context(|| {
            format!(
                "SearXNG search API returned invalid JSON: {}",
                Self::preview_body(&body)
            )
        })?;

        println!(
            "SearXNG JSON search API is available. \
             Received {} results.",
            data.results.len()
        );

        Ok(())
    }

    /*
    ============================================================
    SEARCH
    ============================================================
    */

    pub async fn search(
        &self,
        query: &str,
        language: Language,
        limit: usize,
    ) -> Result<Vec<SearchResult>> {
        let query = query.trim();

        if query.is_empty() {
            anyhow::bail!("Web search query cannot be empty");
        }

        if limit == 0 {
            return Ok(Vec::new());
        }

        /*
        --------------------------------------------------------
        LANGUAGE
        --------------------------------------------------------
        */

        let language_code = language.code().to_string();

        /*
        --------------------------------------------------------
        CACHE KEY
        --------------------------------------------------------
        */

        let cache_key: String = format!("{}|{}|{}", self.base_url, language_code, query);

        /*
        --------------------------------------------------------
        CACHE LOOKUP
        --------------------------------------------------------
        */

        if let Some(results) = self.get_cached(&cache_key) {
            println!("SearXNG cache hit: '{}'", query);

            return Ok(results.into_iter().take(limit).collect());
        }

        /*
        --------------------------------------------------------
        ENDPOINT
        --------------------------------------------------------
        */

        let endpoint = format!("{}/search", self.base_url);

        println!("SearXNG search: '{}' [{}]", query, language_code);

        /*
        --------------------------------------------------------
        QUERY PARAMETERS
        --------------------------------------------------------
        */

        let query_params = vec![
            ("q".to_string(), query.to_string()),
            ("format".to_string(), "json".to_string()),
            ("language".to_string(), language_code.clone()),
            ("safesearch".to_string(), "2".to_string()),
            ("categories".to_string(), "general".to_string()),
        ];

        /*
        --------------------------------------------------------
        REQUEST
        --------------------------------------------------------
        */

        let response = self.request_with_backoff(&endpoint, &query_params).await?;

        /*
        --------------------------------------------------------
        JSON
        --------------------------------------------------------
        */

        let body = read_and_validate_json_response(response).await?;

        let data = serde_json::from_str::<SearxResponse>(&body).with_context(|| {
            format!(
                "Failed to parse SearXNG JSON response: {}",
                Self::preview_body(&body)
            )
        })?;

        /*
        --------------------------------------------------------
        CONVERT RESULTS
        --------------------------------------------------------
        */

        let results = data
            .results
            .into_iter()
            .filter_map(|result| {
                let title = result.title.trim().to_string();

                let url = result.url.trim().to_string();

                let snippet = result.content.trim().to_string();

                if title.is_empty() && url.is_empty() && snippet.is_empty() {
                    return None;
                }

                Some(SearchResult {
                    title,
                    url,
                    snippet,
                })
            })
            .collect::<Vec<_>>();

        println!("SearXNG returned {} usable results", results.len());

        /*
        --------------------------------------------------------
        CACHE
        --------------------------------------------------------
        */

        self.store_cached(cache_key, results.clone());

        /*
        --------------------------------------------------------
        LIMIT
        --------------------------------------------------------
        */

        Ok(results.into_iter().take(limit).collect())
    }

    /*
    ============================================================
    HTTP REQUEST WITH BACKOFF
    ============================================================
    */

    async fn request_with_backoff(
        &self,
        endpoint: &str,
        query: &[(String, String)],
    ) -> Result<reqwest::Response> {
        for attempt in 0..=MAX_RETRIES {
            println!(
                "SearXNG request attempt {}/{}",
                attempt + 1,
                MAX_RETRIES + 1
            );

            /*
            ----------------------------------------------------
            REQUEST
            ----------------------------------------------------
            */

            let response = self
                .client
                .get(endpoint)
                .query(query)
                .send()
                .await
                .with_context(|| format!("Failed to contact SearXNG at {}", endpoint))?;

            let status = response.status();

            /*
            ----------------------------------------------------
            SUCCESS
            ----------------------------------------------------
            */

            if status.is_success() {
                return Ok(response);
            }

            /*
            ----------------------------------------------------
            RATE LIMIT
            ----------------------------------------------------
            */

            if status.as_u16() == 429 {
                let retry_after = retry_after_seconds(&response);

                /*
                ------------------------------------------------
                No attempts remaining
                ------------------------------------------------
                */

                if attempt >= MAX_RETRIES {
                    drop(response);

                    anyhow::bail!(
                        "SearXNG rate limit reached \
                         after {} retries (HTTP 429). \
                         Retry-After: {}",
                        MAX_RETRIES,
                        format_retry_after(retry_after)
                    );
                }

                /*
                ------------------------------------------------
                Exponential backoff
                ------------------------------------------------
                */

                let exponent = attempt as u32;

                let exponential_ms =
                    INITIAL_BACKOFF_MS.saturating_mul(2u64.saturating_pow(exponent));

                let capped_ms = exponential_ms.min(MAX_BACKOFF_SECONDS * 1_000);

                /*
                ------------------------------------------------
                JITTER
                ------------------------------------------------

                rand 0.9+:
                    rand::rng()
                    random_range()
                ------------------------------------------------
                */

                let jitter_ms = rand::rng().random_range(0..=500u64);

                let local_delay = Duration::from_millis(capped_ms.saturating_add(jitter_ms));

                /*
                ------------------------------------------------
                RETRY-AFTER
                ------------------------------------------------
                */

                let delay = match retry_after {
                    Some(seconds) => local_delay.max(Duration::from_secs(seconds)),

                    None => local_delay,
                };

                println!(
                    "SearXNG returned HTTP 429. \
                     Waiting {:?} before retry.",
                    delay
                );

                /*
                ------------------------------------------------
                Drop response before retry.
                ------------------------------------------------
                */

                drop(response);

                sleep(delay).await;

                continue;
            }

            /*
            ----------------------------------------------------
            FORBIDDEN
            ----------------------------------------------------
            */

            if status.as_u16() == 403 {
                let body = response.text().await.unwrap_or_default();

                anyhow::bail!(
                    "SearXNG returned HTTP 403 Forbidden. \
                     JSON API access may be disabled \
                     or this instance is refusing the request. \
                     Response: {}",
                    Self::preview_body(&body)
                );
            }

            /*
            ----------------------------------------------------
            OTHER ERRORS
            ----------------------------------------------------
            */

            let body = response.text().await.unwrap_or_default();

            anyhow::bail!(
                "SearXNG returned HTTP {} {}. \
                 Response: {}",
                status.as_u16(),
                status.canonical_reason().unwrap_or(""),
                Self::preview_body(&body)
            );
        }

        anyhow::bail!("SearXNG request failed unexpectedly");
    }

    /*
    ============================================================
    CACHE GET
    ============================================================
    */

    fn get_cached(&self, key: &str) -> Option<Vec<SearchResult>> {
        let mut cache = self.cache.lock().ok()?;

        let entry = cache.get(key)?;

        /*
        --------------------------------------------------------
        Expired
        --------------------------------------------------------
        */

        if entry.created_at.elapsed() > Duration::from_secs(CACHE_TTL_SECONDS) {
            cache.remove(key);

            return None;
        }

        Some(entry.results.clone())
    }

    /*
    ============================================================
    CACHE STORE
    ============================================================
    */

    fn store_cached(&self, key: String, results: Vec<SearchResult>) {
        let Ok(mut cache) = self.cache.lock() else {
            return;
        };

        /*
        --------------------------------------------------------
        Remove oldest entry if cache is full.
        --------------------------------------------------------
        */

        if cache.len() >= MAX_CACHE_ENTRIES {
            if let Some(oldest_key) = cache
                .iter()
                .min_by_key(|(_, entry)| entry.created_at)
                .map(|(key, _)| key.clone())
            {
                cache.remove(&oldest_key);
            }
        }

        /*
        --------------------------------------------------------
        Insert
        --------------------------------------------------------
        */

        cache.insert(
            key,
            CacheEntry {
                created_at: Instant::now(),

                results,
            },
        );
    }
}

/*
============================================================
RETRY-AFTER
============================================================
*/

fn retry_after_seconds(response: &reqwest::Response) -> Option<u64> {
    response
        .headers()
        .get(RETRY_AFTER)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.trim().parse::<u64>().ok())
}

/*
============================================================
FORMAT RETRY-AFTER
============================================================
*/

fn format_retry_after(seconds: Option<u64>) -> String {
    match seconds {
        Some(seconds) => format!("{} seconds", seconds).to_string(),

        None => "unknown".to_string(),
    }
}

/*
============================================================
READ + VALIDATE JSON
============================================================
*/

async fn read_and_validate_json_response(response: reqwest::Response) -> Result<String> {
    let status = response.status();

    let content_type = response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("")
        .to_string();

    /*
    --------------------------------------------------------
    Read body exactly once.
    --------------------------------------------------------
    */

    let body = response
        .text()
        .await
        .context("Failed to read SearXNG response")?;

    let trimmed = body.trim_start();

    /*
    --------------------------------------------------------
    HTML detection
    --------------------------------------------------------
    */

    let looks_like_html = trimmed.starts_with("<!DOCTYPE")
        || trimmed.starts_with("<!doctype")
        || trimmed.starts_with("<html")
        || trimmed.starts_with("<HTML");

    if looks_like_html {
        anyhow::bail!(
            "SearXNG search API returned HTTP {} \
             but returned HTML instead of JSON. \
             Content-Type: '{}'. \
             JSON search may not be enabled on this \
             instance. Response: {}",
            status.as_u16(),
            content_type,
            body_preview(&body)
        );
    }

    /*
    --------------------------------------------------------
    Content-Type check
    --------------------------------------------------------

    Accept JSON-looking bodies even when the server has
    an incorrect Content-Type header.
    --------------------------------------------------------
    */

    let looks_like_json = content_type
        .to_ascii_lowercase()
        .contains("application/json");

    if !looks_like_json {
        let first_char = trimmed.chars().next();

        let json_like = matches!(first_char, Some('{') | Some('['));

        if !json_like {
            anyhow::bail!(
                "SearXNG search API returned HTTP {} \
                 but the response was not JSON. \
                 Content-Type: '{}'. \
                 Response: {}",
                status.as_u16(),
                content_type,
                body_preview(&body)
            );
        }
    }

    /*
    --------------------------------------------------------
    Validate JSON
    --------------------------------------------------------
    */

    serde_json::from_str::<serde_json::Value>(&body).with_context(|| {
        format!(
            "SearXNG search API returned invalid JSON. \
             Content-Type: '{}'. Response: {}",
            content_type,
            body_preview(&body)
        )
    })?;

    Ok(body)
}

/*
============================================================
BODY PREVIEW
============================================================
*/

fn body_preview(body: &str) -> String {
    body.chars()
        .take(MAX_BODY_PREVIEW_CHARS)
        .collect::<String>()
        .replace('\n', " ")
        .replace('\r', " ")
}

/*
============================================================
FORMAT SEARCH CONTEXT
============================================================
*/

pub fn format_search_context(results: &[SearchResult]) -> String {
    const MAX_SNIPPET_CHARS: usize = 800;

    if results.is_empty() {
        return String::new();
    }

    let mut context = String::from("Web search results:\n\n");

    for (index, result) in results.iter().enumerate() {
        let snippet = result
            .snippet
            .chars()
            .take(MAX_SNIPPET_CHARS)
            .collect::<String>();

        context.push_str(&format!(
            "[Source {}]\n\
                 Title: {}\n\
                 URL: {}\n\
                 Snippet: {}\n\n",
            index + 1,
            result.title,
            result.url,
            snippet,
        ));
    }

    context
}

/*
============================================================
TAURI COMMAND — TEST CONNECTION
============================================================
*/

#[tauri::command]
pub async fn test_searxng_connection(searxng_url: String) -> Result<String, String> {
    let url = searxng_url.trim();

    if url.is_empty() {
        return Err("SearXNG URL cannot be empty".to_string());
    }

    let search =
        WebSearch::new(url).map_err(|error| format!("Failed to initialize SearXNG: {}", error))?;

    search
        .test_connection()
        .await
        .map_err(|error| format!("SearXNG connection failed: {}", error))?;

    Ok("SearXNG server and JSON search API are available.".to_string())
}

/*
============================================================
TAURI COMMAND — TEST SEARCH API
============================================================
*/

#[tauri::command]
pub async fn test_searxng_search(searxng_url: String) -> Result<String, String> {
    let url = searxng_url.trim();

    if url.is_empty() {
        return Err("SearXNG URL cannot be empty".to_string());
    }

    let search =
        WebSearch::new(url).map_err(|error| format!("Failed to initialize SearXNG: {}", error))?;

    search
        .test_search()
        .await
        .map_err(|error| format!("SearXNG search test failed: {}", error))?;

    Ok("SearXNG JSON search API is available.".to_string())
}
