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
        log::warn!("User likely clicked an empty tome: link?");
        return;
    }

    let url = urls[0].clone();
    let path = url.path();

    match path {
        "mcp/install" => {
            mcp_install(url.query().unwrap());
        }
        _ => {
            log::warn!("Unknown runebook function for {:?}", path);
        }
    }
}
