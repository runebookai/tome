use std::collections::HashMap;

use rmcp::model::Tool;
use serde::Deserialize;
use serde::Serialize;
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

#[derive(serde::Deserialize)]
enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    HEAD,
}

#[derive(Deserialize)]
pub struct ProxyOptions {
    method: HttpMethod,
    body: Option<String>,
}

#[derive(Serialize)]
pub struct HTTPResponse {
    status: u16,
    status_text: String,
    headers: HashMap<String, String>,
    body: String,
}

// TODO: Remove this code pending resolution of https://github.com/ollama/ollama/issues/10507
#[tauri::command]
pub async fn proxy_request(url: String, options: ProxyOptions) -> Result<HTTPResponse, String> {
    let client = reqwest::Client::new();

    let request = match options.method {
        HttpMethod::GET => client.get(&url),
        HttpMethod::POST => client.post(&url),
        HttpMethod::PUT => client.put(&url),
        HttpMethod::DELETE => client.delete(&url),
        HttpMethod::HEAD => client.head(&url),
    }
    .header("Origin", "http://localhost")
    .header("Content-Type", "application/json");

    let request = if let Some(json) = options.body {
        request.body(json)
    } else {
        request
    };

    let response = request
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status().into();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("")
        .to_string();
    let headers = response
        .headers()
        .iter()
        .map(|(k, v)| {
            (
                k.to_string(),
                v.to_str()
                    .unwrap_or("Failed to build response: invalid UTF-8 in headers")
                    .to_string(),
            )
        })
        .collect::<HashMap<_, _>>();
    let body = match options.method {
        HttpMethod::HEAD => String::new(),
        _ => response
            .text()
            .await
            .map_err(|e| format!("Failed to build response: failed to read body: {}", e))?,
    };

    Ok(HTTPResponse {
        status,
        status_text,
        headers,
        body,
    })
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
