use rmcp::model::Tool;
use tauri::AppHandle;

use crate::mcp;
use crate::State;

macro_rules! ok_or_err {
    ($expr:expr) => {
        match $expr {
            Ok(e) => Ok(e),
            Err(_) => Err(()),
        }
    };
}

#[tauri::command]
pub async fn get_metadata(command: String, app: AppHandle) -> Result<String, ()> {
    ok_or_err!(mcp::peer_info(command, app).await)
}

#[tauri::command]
pub async fn start_mcp_server(session_id: i32, command: String, app: AppHandle) -> Result<(), ()> {
    println!("-> start_mcp_server({}, {})", session_id, command);
    ok_or_err!(mcp::start(session_id, command, app).await)
}

#[tauri::command]
pub async fn stop_mcp_server(
    session_id: i32,
    name: String,
    state: tauri::State<'_, State>,
) -> Result<(), ()> {
    println!("-> stop_mcp_server({}, {})", session_id, name);
    ok_or_err!(mcp::stop(session_id, name, state).await)
}

#[tauri::command]
pub async fn get_mcp_tools(
    session_id: i32,
    state: tauri::State<'_, State>,
) -> Result<Vec<Tool>, ()> {
    ok_or_err!(mcp::get_tools(session_id, state).await)
}

#[tauri::command]
pub async fn call_mcp_tool(
    session_id: i32,
    name: String,
    arguments: serde_json::Map<String, serde_json::Value>,
    state: tauri::State<'_, State>,
) -> Result<String, ()> {
    Ok(mcp::call_tool(session_id, name, arguments, state)
        .await
        .unwrap())
}

#[tauri::command]
pub async fn stop_session(session_id: i32, state: tauri::State<'_, State>) -> Result<(), ()> {
    ok_or_err!(mcp::stop_session(session_id, state).await)
}
