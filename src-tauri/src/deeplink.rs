use tauri::{Emitter, Url};

use crate::APP_HANDLE;

pub fn install_mcp_server(payload: String) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("install-mcp-server", payload)
        .unwrap();
}

pub fn handle(urls: Vec<Url>) -> Result<(), ()> {
    if urls.is_empty() {
        log::warn!("User likely clicked an empty tome:// link?");
        return Ok(());
    }

    let host = urls[0].host_str();
    match host {
        Some("install-mcp-server") => {
            if let Some(pair) = urls[0].query_pairs().find(|(k, _)| k == "payload") {
                install_mcp_server(pair.1.to_string());
            } else {
                log::warn!("Missing `payload` query param");
            }
        }
        Some(&_) => {
            log::warn!("Unknown runebook function for {:?}", host);
        }
        None => {
            log::warn!("Malformed runebook link: missing host for {:?}", urls[0]);
        }
    }

    Ok(())
}
