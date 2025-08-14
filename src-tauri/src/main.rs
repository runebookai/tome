// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(unused_extern_crates)]

mod commands;
mod daemon;
mod deeplink;
mod http;
mod mcp;
mod migrations;
mod process;
mod state;
mod window;

use std::sync::OnceLock;

use process::Process;
use tauri::{AppHandle, Manager, RunEvent};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};

use crate::migrations::migrations;
use crate::state::State;
use crate::window::configure_window;
#[cfg(target_os = "macos")]
use crate::window::macos::configure_macos_window;

// Globally available app handle
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {}))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:tome.db", migrations())
                .build(),
        )
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("log".to_string()),
                    },
                ))
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .setup(|app| {
            APP_HANDLE.set(app.handle().clone()).unwrap();

            let window = app.get_window("main").expect("Couldn't get main window");

            log_panics::init();

            app.manage(State {
                sessions: Default::default(),
                watchers: Default::default(),
            });

            configure_window(&window);

            #[cfg(target_os = "macos")]
            configure_macos_window(&window);

            let _ = window.restore_state(StateFlags::all());

            app.deep_link().on_open_url(|event| {
                deeplink::handle(event.urls());
            });

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(mcp::bootstrap(handle));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::http::fetch,
            // MCP
            commands::get_metadata,
            commands::get_mcp_tools,
            commands::call_mcp_tool,
            commands::start_mcp_server,
            commands::stop_mcp_server,
            commands::rename_mcp_server,
            // Sessions
            commands::stop_session,
            // Misc
            commands::restart,
            commands::watch,
            commands::unwatch_all,
        ])
        .build(tauri::generate_context!())
        .expect("error running Tome");

    app.run(|app, event| {
        match event {
            RunEvent::ExitRequested { .. } => {
                let _ = app.save_window_state(StateFlags::all());
            }

            RunEvent::Exit => {
                // Ensure we kill every child (and child of child, of child, etc.)
                // MCP server, watcher, etc. process
                Process::current().kill().unwrap();
            }

            _ => {}
        }
    });
}
