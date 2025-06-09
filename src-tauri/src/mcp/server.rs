use std::collections::HashMap;

use crate::process::Process;

use anyhow::Result;
use rmcp::model::{CallToolRequestParam, RawContent, Tool};
use rmcp::service::ServiceRole;
use rmcp::ServiceExt;
use rmcp::{service::RunningService, RoleClient};
use sysinfo::Pid;
use tauri::AppHandle;

use super::process::McpProcess;

type Service = RunningService<RoleClient, ()>;

#[derive(Debug)]
pub struct McpServer {
    service: Service,
    pid: Pid,
    custom_name: Option<String>,
}

impl McpServer {
    pub async fn start(
        command: String,
        mut args: Vec<String>,
        env: HashMap<String, String>,
        app: AppHandle,
    ) -> Result<Self> {
        if command.contains("npx") {
            args.insert(0, "-y".to_string());
        }

        let proc = McpProcess::start(command, args, env, app)?;
        let pid = proc.pid();
        let service = ().serve(proc).await?;
        Ok(Self { 
            service, 
            pid,
            custom_name: None,
        })
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
        match Process::find(self.pid) {
            Some(p) => p.kill(),
            None => Ok(false),
        }
    }
}
