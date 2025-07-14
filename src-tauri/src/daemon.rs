use notify::event::{DataChange, ModifyKind};
use notify::{Event, EventKind, RecursiveMode, Result as NotifyResult, Watcher};
use serde::Serialize;
use serde_json;
use std::path::{Path, PathBuf};
use std::thread;
use tauri::Emitter;
use thiserror::Error;
use tokio::sync::mpsc;

use crate::APP_HANDLE;

#[derive(Debug, Error)]
pub enum DispatchError {
    #[error("Failed to serialize filesystem event: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("Failed to initialize application handle")]
    AppHandleUnavailable,

    #[error("Failed to emit filesystem event: {0}")]
    Emit(#[from] tauri::Error),
}

#[derive(Serialize)]
struct EventData {
    paths: Vec<PathBuf>,
}

fn dispatch(notify_event: Event) -> Result<(), DispatchError> {
    let app_handle = APP_HANDLE
        .get()
        .ok_or(DispatchError::AppHandleUnavailable)?;

    let action = match notify_event.kind {
        EventKind::Create(_) => "created",
        EventKind::Modify(ModifyKind::Data(DataChange::Content)) => "updated",
        _ => return Ok(()),
    };

    let name = format!("filesystem/{action}");
    let data = EventData {
        paths: notify_event.paths,
    };

    app_handle.emit(&name, &data)?;
    Ok(())
}

pub async fn watch<P: AsRef<Path>>(path: P) -> NotifyResult<()> {
    let path = path.as_ref().to_path_buf();
    let (tx, mut rx) = mpsc::unbounded_channel::<NotifyResult<Event>>();

    thread::spawn(move || {
        let tx_inner = tx.clone();
        let mut watcher = notify::recommended_watcher(move |res| {
            if let Err(err) = tx_inner.send(res) {
                println!("Failed to notify: {err:?}");
            }
        })
        .expect("Failed to create watcher");

        watcher
            .watch(&path, RecursiveMode::Recursive)
            .expect("Failed to watch path");

        std::thread::park();
    });

    tauri::async_runtime::spawn(async move {
        while let Some(res) = rx.recv().await {
            if let Ok(event) = res {
                dispatch(event.clone()).expect(&format!("Failed to dispatch: {event:?}"));
            }
        }
    });

    Ok(())
}
