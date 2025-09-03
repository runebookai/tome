use serde::Serialize;
use tauri::{Emitter, Url};

use crate::APP_HANDLE;

// Smithery uses a URL format from VSCode, which is insane. It looks like:
//
// `tome:mcp/install?<url-encoded-json>`
//
// No "//" after the scheme and no query param key. Thanks Microsoft.
//
pub fn mcp_install(query: &str) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("mcp/install", query)
        .unwrap();
}

// Import deeplinks resemble:
//
// `tome://apps/import?app=<url-encoded-json>`
//
pub fn import_app(query: &str) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("apps/import", query)
        .unwrap();
}

pub fn handle(urls: Vec<Url>) {
    if urls.is_empty() {
        log::warn!("User likely clicked an empty tome: link?");
        return;
    }

    let url = urls[0].clone();
    let action;

    // Smithery required deeplink URLs to take the form "tome:mcp/install" instead of a correct URL
    // in the form of "tome://" (with the slashes).
    //
    // All of our other deeplinks follow the URL spec correctly though, so handle both cases
    // explcitly since the Smithery version causes the `URL` lib to act differently.
    //
    if url.to_string().contains("tome://") {
        action = format!("{}{}", url.domain().unwrap(), url.path());
    } else {
        action = url.path().to_string();
    };

    log::info!("[DEEPLINK] {url}: {action}");

    match action.as_str() {
        "mcp/install" => {
            if let Some(query) = url.query() {
                mcp_install(query);
            }
        }
        "apps/import" => {
            if let Some(query) = url.query() {
                import_app(query);
            }
        }
        _ => {
            log::warn!("Unknown runebook function for {:?}", action.clone());
        }
    }
}
