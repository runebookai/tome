pub(crate) mod process;
pub(crate) mod server;

use std::collections::HashMap;
use std::path::PathBuf;

use crate::state::State;

use anyhow::{anyhow, Result};
use rmcp::model::CallToolRequestParam;
use rmcp::model::Tool;
use server::McpServer;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tokio::process::Command;

// Maps uvx/npx/any future command to whatever command we need to run for the user's OS
//
pub fn get_os_specific_command(command: &str, app: &AppHandle) -> Result<Command> {
    let os_specific_command = match command {
        "python" => {
            if cfg!(windows) {
                return Err(anyhow!("Python not supported on Windows yet"));
            } else {
                "python"
            }
        }
        "uvx" => {
            if cfg!(windows) {
                "uvx.exe"
            } else {
                "uvx"
            }
        }
        "node" => {
            if cfg!(windows) {
                "node.cmd"
            } else {
                "node"
            }
        }
        "npx" => {
            if cfg!(windows) {
                "npx.cmd"
            } else {
                "npx"
            }
        }
        "bunx" => {
            if cfg!(windows) {
                "bunx.cmd"
            } else {
                "bunx"
            }
        }
        _ if command.contains("imcp-server") || command.contains("Tinderbox") => {
            if cfg!(target_os = "macos") {
                command
            } else {
                return Err(anyhow!("Are you trying to use a MacOS application outside of MacOS? Please tell us about this in our Discord."));
            }
        }
        _ => return Err(anyhow!("{} servers not supported.", command)),
    };

    // imcp/tinderbox is user-installed, and so doesn't exist in our base dir 🙃
    if os_specific_command.contains("imcp-server") || os_specific_command.contains("Tinderbox") {
        Ok(Command::new(PathBuf::from(os_specific_command)))
    } else {
        Ok(Command::new(
            app.path()
                .resolve(os_specific_command, BaseDirectory::Resource)?,
        ))
    }
}

// Install Python (uv/uvx) and Node (npm/npx), via Hermit.
//
pub async fn bootstrap(app: AppHandle) -> Result<()> {
    let mut uvx = get_os_specific_command("uvx", &app)?;
    let mut npx = get_os_specific_command("npx", &app)?;

    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        uvx.creation_flags(CREATE_NO_WINDOW);
        npx.creation_flags(CREATE_NO_WINDOW);
    }

    let uvx = uvx.arg("--help");
    uvx.kill_on_drop(true);

    let npx = npx.arg("--help");
    npx.kill_on_drop(true);

    uvx.output().await?;
    npx.output().await?;

    Ok(())
}

// Start an MCP Server
//
// # Process Management Shenanigans
//
// Most mcp commands use either `npx` or `uvx`. Those commands end up just spawning _another_
// process, which is the actual mcp server.
//
// Since children of child processes DO NOT get killed, when you kill the child, we need to
// manually do that. Otherwise we end up with a bunch of zombie, detached, mcp servers.
//
// To deal with this, we collect child pids before we launch the server and child pids after it's
// launched. We track those, then explicitly kill them all when in `stop`.
//
pub async fn start(
    session_id: i32,
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    app: AppHandle,
) -> Result<()> {
    let handle = app.clone();
    let state = handle.state::<State>();
    let server = McpServer::start(command, args, env, app).await?;

    let mut sessions = state.sessions.lock().await;
    let mut session = sessions.remove(&session_id).unwrap_or_default();

    // Server already running. Kill the one we just spun up. It's a little weird to start the
    // process then immediately kill it, but we need it running to get the name :/
    //
    // Makes the `start_mcp_server` command idempotent.
    //
    if session.mcp_servers.contains_key(&server.name()) {
        server.kill()?;
        sessions.insert(session_id, session);
        return Ok(());
    }

    server.tools().await?.iter().for_each(|tool| {
        session.tools.insert(tool.name.to_string(), server.name());
    });

    session.mcp_servers.insert(server.name(), server);
    sessions.insert(session_id, session);

    Ok(())
}

pub async fn stop(session_id: i32, name: String, state: tauri::State<'_, State>) -> Result<()> {
    let mut sessions = state.sessions.lock().await;

    if let Some(mut session) = sessions.remove(&session_id) {
        if let Some(server) = session.mcp_servers.remove(&name) {
            server.kill()?;
        }
        sessions.insert(session_id, session);
    }

    Ok(())
}

pub async fn stop_session(session_id: i32, state: tauri::State<'_, State>) -> Result<()> {
    let mut sessions = state.sessions.lock().await;

    if let Some(session) = sessions.remove(&session_id) {
        for server in session.mcp_servers.values() {
            server.kill()?;
        }
    }

    Ok(())
}

pub async fn get_tools(session_id: i32, state: tauri::State<'_, State>) -> Result<Vec<Tool>> {
    let mut tools: Vec<Tool> = vec![];
    let sessions = state.sessions.lock().await;

    let running_session = match sessions.get(&session_id) {
        Some(s) => s,
        None => return Ok(vec![]),
    };

    for server in running_session.mcp_servers.values() {
        tools.extend(server.tools().await?)
    }

    Ok(tools)
}

pub async fn call_tool(
    session_id: i32,
    name: String,
    arguments: serde_json::Map<String, serde_json::Value>,
    state: tauri::State<'_, State>,
) -> Result<String> {
    let sessions = state.sessions.lock().await;
    let running_session = sessions.get(&session_id).unwrap();
    let service_name = running_session.tools.get(&name).unwrap().clone();
    let server = running_session.mcp_servers.get(&service_name).unwrap();

    let tool_call = CallToolRequestParam {
        name: std::borrow::Cow::from(name),
        arguments: Some(arguments),
    };

    server.call_tool(tool_call).await
}

pub async fn peer_info(
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    app: AppHandle,
) -> Result<String> {
    let server = McpServer::start(command, args, env, app).await?;
    let peer_info = server.peer_info();
    server.kill()?;
    Ok(serde_json::to_string(&peer_info)?)
}

pub async fn rename_server(
    session_id: i32,
    old_name: String,
    new_name: String,
    state: tauri::State<'_, State>,
) -> Result<()> {
    let mut sessions = state.sessions.lock().await;

    if let Some(session) = sessions.get_mut(&session_id) {
        if let Some(server) = session.mcp_servers.get_mut(&old_name) {
            // Update the server's name
            server.set_name(new_name.clone());

            // Update the tools mapping
            let tools_to_update: Vec<String> = session
                .tools
                .iter()
                .filter(|(_, server_name)| *server_name == &old_name)
                .map(|(tool_name, _)| tool_name.clone())
                .collect();

            for tool_name in tools_to_update {
                session.tools.insert(tool_name, new_name.clone());
            }

            // Move the server to the new name in the map
            if let Some(server) = session.mcp_servers.remove(&old_name) {
                session.mcp_servers.insert(new_name, server);
            }
        }
    }

    Ok(())
}
