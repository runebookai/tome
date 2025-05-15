use std::collections::HashMap;

use anyhow::Result;
use rmcp::service::ServiceRole;
use rmcp::transport::IntoTransport;
use sysinfo::Pid;
use tauri::AppHandle;
use tokio::io::AsyncRead;
use tokio::process::{Child, ChildStdin, ChildStdout};

use super::get_os_specific_command;

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
        let mut cmd = get_os_specific_command(&command, &app)?;
        let cmd = cmd.args(&args);

        log::info!("Executing command: {:?} {:?}", cmd, args);

        cmd.kill_on_drop(true)
            .envs(env)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped());

        #[cfg(windows)]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

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
