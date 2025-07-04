use std::collections::HashMap;
use std::time::Duration;

use crate::process::Process;

use anyhow::Result;
use rmcp::model::{CallToolRequestParam, RawContent, Tool};
use rmcp::service::ServiceRole;
use rmcp::ServiceExt;
use rmcp::{service::RunningService, RoleClient};
use sysinfo::Pid;
use tauri::AppHandle;

use super::process::McpProcess;
use super::http::{HttpTransport, HttpTransportConfig};

type Service = RunningService<RoleClient, ()>;

#[derive(Debug)]
pub enum McpTransport {
    Stdio { pid: Pid },
    Http { url: String, session_id: Option<String> },
}

#[derive(Debug)]
pub struct McpServer {
    service: Service,
    transport: McpTransport,
    custom_name: Option<String>,
}

impl McpServer {
    pub async fn start(
        command: String,
        mut args: Vec<String>,
        env: HashMap<String, String>,
        transport_type: String,
        transport_config: serde_json::Value,
        app: AppHandle,
    ) -> Result<Self> {
        match transport_type.as_str() {
            "stdio" => {
                if command.contains("npx") {
                    args.insert(0, "-y".to_string());
                }

                let proc = McpProcess::start(command, args, env, app)?;
                let pid = proc.pid();
                let service = ().serve(proc).await?;
                Ok(Self { 
                    service, 
                    transport: McpTransport::Stdio { pid },
                    custom_name: None,
                })
            }
            "http" => {
                let url = transport_config
                    .get("url")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| anyhow::anyhow!("HTTP transport requires 'url' in config"))?
                    .to_string();

                let timeout = transport_config
                    .get("timeout")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(30);

                let retries = transport_config
                    .get("retries")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(3) as u32;

                let mut headers = HashMap::new();
                if let Some(header_obj) = transport_config.get("headers").and_then(|v| v.as_object()) {
                    for (k, v) in header_obj {
                        if let Some(v_str) = v.as_str() {
                            headers.insert(k.clone(), v_str.to_string());
                        }
                    }
                }

                let config = HttpTransportConfig {
                    url: url.clone(),
                    timeout: Duration::from_secs(timeout),
                    retries,
                    session_id: None, // Will be set during initialization
                    headers,
                };

                let transport = HttpTransport::new(config);
                
                // Initialize the HTTP session
                transport.initialize_session().await?;
                
                // Get the session ID after initialization
                let session_id = transport.get_session_id().await;
                
                let service = ().serve(transport).await?;
                
                Ok(Self { 
                    service, 
                    transport: McpTransport::Http { url, session_id },
                    custom_name: None,
                })
            }
            _ => Err(anyhow::anyhow!("Unsupported transport type: {}", transport_type)),
        }
    }

    pub fn name(&self) -> String {
        self.custom_name.clone().unwrap_or_else(|| self.peer_info().server_info.name)
    }

    pub fn set_name(&mut self, new_name: String) {
        self.custom_name = Some(new_name);
    }

    pub fn peer_info(&self) -> <RoleClient as ServiceRole>::PeerInfo {
        self.service.peer_info().clone()
    }

    pub async fn tools(&self) -> Result<Vec<Tool>> {
        Ok(self.service.list_all_tools().await?)
    }

    pub async fn call_tool(&self, request: CallToolRequestParam) -> Result<String> {
        Ok(self
            .service
            .call_tool(request)
            .await?
            .content
            .iter()
            .map(|r| match r.raw.clone() {
                RawContent::Text(t) => t.text,
                _ => String::new(),
            })
            .collect::<Vec<String>>()
            .join("\n"))
    }

    pub fn kill(&self) -> Result<bool> {
        match &self.transport {
            McpTransport::Stdio { pid } => {
                match Process::find(*pid) {
                    Some(p) => p.kill(),
                    None => Ok(false),
                }
            }
            McpTransport::Http { .. } => {
                // HTTP connections don't need to be killed like processes
                // The connection will be closed when the service is dropped
                Ok(true)
            }
        }
    }
}
