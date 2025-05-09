use tauri::{Emitter, Url};

use crate::APP_HANDLE;

pub fn mcp_install(query: &str) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("mcp/install", query)
        .unwrap();
}

pub fn handle(urls: Vec<Url>) {
    if urls.is_empty() {
        log::warn!("User likely clicked an empty tome:// link?");
        return;
    }

    let url = urls[0].clone();
    let host = url.host_str();

    match host {
        Some("mcp") => {
            handle_mcp(url);
        }
        Some(&_) => {
            log::warn!("Unknown runebook function for {:?}", host);
        }
        None => {
            log::warn!("Malformed runebook link: missing host for {:?}", url);
        }
    }
}

fn handle_mcp(url: Url) {
    if url.path() == "/install" {
        mcp_install(url.query().unwrap());
    } else {
        log::warn!("Unsupported MCP event: {}", url.path());
    }
}
