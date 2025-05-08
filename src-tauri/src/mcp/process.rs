use std::collections::HashMap;

use anyhow::{anyhow, Result};
use rmcp::service::ServiceRole;
use rmcp::transport::IntoTransport;
use sysinfo::Pid;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tokio::io::AsyncRead;
use tokio::process::{Child, ChildStdin, ChildStdout, Command};

#[derive(Debug)]
pub(crate) struct McpProcess {
    pub child: Child,
    pub child_stdin: ChildStdin,
    pub child_stdout: ChildStdout,
}

impl McpProcess {
    pub fn start(
        command: String,
        args: Vec<String>,
        env: HashMap<String, String>,
        app: AppHandle,
    ) -> Result<Self> {
        let command = match &*command {
            "uvx" => app.path().resolve("uvx", BaseDirectory::Resource)?,
            "npx" => app.path().resolve("npx", BaseDirectory::Resource)?,
            s => return Err(anyhow!("{} servers not supported", s)),
        };

        let mut cmd = Command::new(command);
        let cmd = cmd.args(args);

        cmd.kill_on_drop(true)
            .envs(env)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped());

        let mut child = cmd.spawn()?;
        let child_stdin = child.stdin.take().unwrap();
        let child_stdout = child.stdout.take().unwrap();

        Ok(Self {
            child,
            child_stdin,
            child_stdout,
        })
    }

    pub fn pid(&self) -> Pid {
        Pid::from_u32(self.child.id().unwrap())
    }

    pub fn split(self) -> (McpProcessOut, ChildStdin) {
        let McpProcess {
            child,
            child_stdin,
            child_stdout,
        } = self;

        (
            McpProcessOut {
                child,
                child_stdout,
            },
            child_stdin,
        )
    }
}

pin_project_lite::pin_project! {
    pub(crate) struct McpProcessOut {
        child: Child,
        #[pin]
        child_stdout: ChildStdout,
    }
}

impl AsyncRead for McpProcessOut {
    fn poll_read(
        self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
        buf: &mut tokio::io::ReadBuf<'_>,
    ) -> std::task::Poll<std::io::Result<()>> {
        self.project().child_stdout.poll_read(cx, buf)
    }
}

impl<R: ServiceRole> IntoTransport<R, std::io::Error, ()> for McpProcess {
    fn into_transport(
        self,
    ) -> (
        impl futures::Sink<rmcp::service::TxJsonRpcMessage<R>, Error = std::io::Error> + Send + 'static,
        impl futures::Stream<Item = rmcp::service::RxJsonRpcMessage<R>> + Send + 'static,
    ) {
        IntoTransport::<R, std::io::Error, rmcp::transport::io::TransportAdapterAsyncRW>::into_transport(
            self.split(),
        )
    }
}
