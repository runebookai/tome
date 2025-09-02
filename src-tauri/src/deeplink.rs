use serde::Serialize;
use tauri::{Emitter, Url};

use crate::APP_HANDLE;

#[derive(Clone, Debug, Serialize)]
struct McpEvent {
    config: String,
}

pub fn mcp_install(query: &str) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit(
            "mcp/install",
            McpEvent {
                config: query.into(),
            },
        )
        .unwrap();
}

#[derive(Clone, Debug, Serialize)]
struct ImportEvent {
    hash: String,
}

pub fn import_app(hash: &str) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("apps/import", ImportEvent { hash: hash.into() })
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
            log::info!("[DEEPLINK][QUERY] {:?}", url.query());
            mcp_install(url.query().unwrap());
        }
        "apps/import" => {
            log::info!("[DEEPLINK][FRAGMENT] {:?}", url.fragment());
            import_app(url.fragment().unwrap());
        }
        _ => {
            log::warn!("Unknown runebook function for {:?}", action.clone());
        }
    }
}
