use notify::event::{DataChange, ModifyKind};
use notify::{Event, EventKind, RecursiveMode, Result as NotifyResult, Watcher};
use serde::Serialize;
use serde_json;
use std::path::{Path, PathBuf};
use std::thread;
use tauri::Emitter;
use thiserror::Error;
use tokio::sync::mpsc;

use crate::state::State;
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
struct PathData {
    paths: Vec<PathBuf>,
}

#[derive(Serialize)]
struct EventData {
    id: i64,
    data: PathData,
}

#[derive(Debug)]
enum JoinHandle {
    Tauri(tauri::async_runtime::JoinHandle<()>),
    Thread(std::thread::JoinHandle<()>),
}

#[derive(Debug, Default)]
pub struct Watchers {
    watchers: Vec<JoinHandle>,
}

impl Watchers {
    pub fn add_tauri(&mut self, handle: tauri::async_runtime::JoinHandle<()>) {
        self.watchers.push(JoinHandle::Tauri(handle));
    }

    pub fn add_thread(&mut self, handle: std::thread::JoinHandle<()>) {
        self.watchers.push(JoinHandle::Thread(handle));
    }

    pub fn join_all(&mut self) {
        while let Some(handle) = self.watchers.pop() {
            match handle {
                JoinHandle::Tauri(w) => {
                    w.abort();
                }
                JoinHandle::Thread(w) => {
                    w.thread().unpark();
                    let _ = w.join();
                }
            }
        }
    }
}

fn dispatch(notify_event: Event, id: i64) -> Result<(), DispatchError> {
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
        id: id,
        data: PathData {
            paths: notify_event.paths,
        },
    };

    app_handle.emit(&name, &data)?;
    Ok(())
}

pub async fn watch<P: AsRef<Path>>(
    path: P,
    id: i64,
    state: tauri::State<'_, State>,
) -> NotifyResult<()> {
    let path = path.as_ref().to_path_buf();
    let (tx, mut rx) = mpsc::unbounded_channel::<NotifyResult<Event>>();

    let mut watchers = state.watchers.lock().await;

    watchers.add_thread(thread::spawn(move || {
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
    }));

    watchers.add_tauri(tauri::async_runtime::spawn(async move {
        while let Some(res) = rx.recv().await {
            if let Ok(event) = res {
                dispatch(event.clone(), id).expect(&format!("Failed to dispatch: {event:?}"));
            }
        }
    }));

    Ok(())
}

pub async fn unwatch_all(state: tauri::State<'_, State>) -> Result<(), String> {
    let mut watchers = state.watchers.lock().await;
    watchers.join_all();
    Ok(())
}
