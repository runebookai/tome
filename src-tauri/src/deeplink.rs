use tauri::{Emitter, Url};

use crate::APP_HANDLE;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct InstallMCPServerArgs {
    query: String,
}

pub fn install_mcp_server(payload: InstallMCPServerArgs) {
    // This emits to a JS function which registers the MCP server in the db
    APP_HANDLE
        .get()
        .unwrap()
        .emit("install_mcp_server", payload)
        .unwrap();
}

pub fn handle(urls: Vec<Url>) -> Result<(), ()> {
    if urls.is_empty() {
        log::warn!("User likely clicked an empty runebook:// link?");
        return Ok(());
    }

    let host = urls[0].host_str();
    match host {
        Some("mcp_install") => {
            // TODO: @Matte - in case this helps you, I'm pretty sure this is the shape of urls:
            // [2025-04-10][15:33:58][app][INFO] deep link URLs: [Url { scheme: "runebook", cannot_be_a_base: false, username: "", password: None, host: Some(Domain("mcp_install")), port: None, path: "", query: Some("name=boop&command=uvx&flags=-y%20runebook/example@latest%20-run%20beepbeep"), fragment: None }]
            // And I think this gets you something like {'name': 'boop', ...} from the above - but don't quote me on it.
            // let mut query_pairs = urls[0].query_pairs();
            let payload = InstallMCPServerArgs {
                query: urls[0].query().unwrap().into(),
            };
            install_mcp_server(payload);
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
