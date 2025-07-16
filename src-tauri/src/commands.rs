use std::collections::HashMap;

use rmcp::model::Tool;
use tauri::AppHandle;

use crate::daemon;
use crate::mcp;
use crate::State;

macro_rules! ok_or_err {
    ($expr:expr) => {
        match $expr {
            Ok(r) => Ok(r),
            Err(e) => Err(e.to_string()),
        }
    };
}

#[tauri::command]
pub async fn get_metadata(
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    app: AppHandle,
) -> Result<String, String> {
    ok_or_err!(mcp::peer_info(command, args, env, app).await)
}

#[tauri::command]
pub async fn start_mcp_server(
    session_id: i32,
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    app: AppHandle,
) -> Result<(), String> {
    println!("-> start_mcp_server({}, {})", session_id, command);
    ok_or_err!(mcp::start(session_id, command, args, env, app).await)
}

#[tauri::command]
pub async fn stop_mcp_server(
    session_id: i32,
    name: String,
    state: tauri::State<'_, State>,
) -> Result<(), String> {
    println!("-> stop_mcp_server({}, {})", session_id, name);
    ok_or_err!(mcp::stop(session_id, name, state).await)
}

#[tauri::command]
pub async fn get_mcp_tools(
    session_id: i32,
    state: tauri::State<'_, State>,
) -> Result<Vec<Tool>, String> {
    ok_or_err!(mcp::get_tools(session_id, state).await)
}

#[tauri::command]
pub async fn call_mcp_tool(
    session_id: i32,
    name: String,
    arguments: serde_json::Map<String, serde_json::Value>,
    state: tauri::State<'_, State>,
) -> Result<String, String> {
    Ok(mcp::call_tool(session_id, name, arguments, state)
        .await
        .unwrap())
}

#[tauri::command]
pub async fn stop_session(session_id: i32, state: tauri::State<'_, State>) -> Result<(), String> {
    ok_or_err!(mcp::stop_session(session_id, state).await)
}

#[tauri::command]
pub fn restart(app: AppHandle) {
    app.restart();
}

#[tauri::command]
pub async fn rename_mcp_server(
    session_id: i32,
    old_name: String,
    new_name: String,
    state: tauri::State<'_, State>,
) -> Result<(), String> {
    println!(
        "-> rename_mcp_server({}, {} -> {})",
        session_id, old_name, new_name
    );
    ok_or_err!(mcp::rename_server(session_id, old_name, new_name, state).await)
}

#[tauri::command]
pub async fn watch(path: String, id: i64, state: tauri::State<'_, State>) -> Result<(), String> {
    daemon::watch(path, id, state.clone()).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn unwatch_all(state: tauri::State<'_, State>) -> Result<(), String> {
    ok_or_err!(daemon::unwatch_all(state).await)
}
