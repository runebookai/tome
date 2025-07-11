use notify::{
    Event, EventKind, RecommendedWatcher, RecursiveMode, Result as NotifyResult, Watcher,
};
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

#[derive(Serialize)]
struct WatcherEvent {
    event_type: String,
    action: String,
    data: EventData,
}

fn dispatch(notify_event: Event) -> Result<String, DispatchError> {
    // Sends serialized filesystem event data to the frontend for processing
    //

    let app_handle = APP_HANDLE
        .get()
        .ok_or(DispatchError::AppHandleUnavailable)?;

    // TODO: There are subtypes for these that we can match on if we want more granularity
    let action = match notify_event.kind {
        EventKind::Create(_) => "create",
        EventKind::Modify(_) => "modify",
        EventKind::Remove(_) => "delete",
        EventKind::Access(_) => "access",
        // TODO: 🤔
        EventKind::Other => "other",
        EventKind::Any => "any",
    };

    let event = WatcherEvent {
        event_type: "filesystem".to_string(),
        action: action.to_string(),
        data: EventData {
            paths: notify_event.paths,
        },
    };

    let serialized_event = serde_json::to_string(&event)?;

    // TODO: Where is this actually going?
    app_handle.emit("daemon/event", &serialized_event)?;

    Ok(serialized_event)
}

pub async fn watch<P: AsRef<Path>>(path: P) -> NotifyResult<()> {
    // Spins up a thread to watch for filesystem events at path.
    // Emits events to the frontend via dispatch.
    //

    let (tx, mut rx) = mpsc::unbounded_channel::<NotifyResult<Event>>();

    let path = path.as_ref().to_path_buf();

    thread::spawn(move || {
        let tx_inner = tx.clone();

        let mut watcher: RecommendedWatcher = notify::recommended_watcher(move |res| {
            if let Err(err) = tx_inner.send(res) {
                println!("Failed to send notify event: {:?}", err);
            }
        })
        .expect("Failed to create watcher");

        watcher
            .watch(&path, RecursiveMode::Recursive)
            .expect("Failed to watch path");

        std::thread::park();
    });

    tokio::spawn(async move {
        while let Some(res) = rx.recv().await {
            match res {
                Ok(event) => {
                    println!("event: {:?}", event);
                    if let Err(e) = dispatch(event) {
                        println!("{}", e);
                    };
                }
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });

    Ok(())
}
