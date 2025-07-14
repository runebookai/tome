use std::collections::HashMap;

use crate::mcp::server::McpServer;

use tokio::sync::Mutex;

type SessionId = i32;
type McpServerName = String;
type ToolName = String;

#[derive(Debug, Default)]
pub struct RunningSession {
    pub mcp_servers: HashMap<McpServerName, McpServer>,
    pub tools: HashMap<ToolName, McpServerName>,
}

#[derive(Debug)]
pub struct State {
    pub sessions: Mutex<HashMap<SessionId, RunningSession>>,
}
