use std::collections::HashMap;

use tauri::{Emitter, Url};

use crate::APP_HANDLE;

pub fn install_mcp_server(payload: String) {
    APP_HANDLE
        .get()
        .unwrap()
        .emit("install-mcp-server", payload)
        .unwrap();
}

// tome://install-mcp-server?payload={"command":"uvx", ...}
//
pub fn handle(urls: Vec<Url>) -> Result<(), ()> {
    if urls.is_empty() {
        log::warn!("User likely clicked an empty tome:// link?");
        return Ok(());
    }

    match urls[0].host_str() {
        Some("install-mcp-server") => {
            if let Some(payload) = urls[0]
                .query_pairs()
                .into_owned()
                .collect::<HashMap<String, String>>()
                .get("payload")
            {
                install_mcp_server(payload.to_string());
            } else {
                log::warn!("Missing `payload` query param");
            }
        }
        Some(other) => {
            log::warn!("Unknown runebook function for {:?}", other);
        }
        None => {
            log::warn!("Malformed runebook link: missing host for {:?}", urls[0]);
        }
    }

    Ok(())
}
