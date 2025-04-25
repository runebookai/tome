// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(unused_extern_crates)]

mod commands;
mod mcp;
mod migrations;
mod process;
mod state;
mod window;

use std::env;

use process::Process;
use tauri::{Manager, RunEvent};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::migrations::migrations;
use crate::state::State;
use crate::window::configure_window;
#[cfg(target_os = "macos")]
use crate::window::macos::configure_macos_window;

fn main() {
    let app = tauri::Builder::default()
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
            let window = app.get_window("main").expect("Couldn't get main window");

            log_panics::init();

            app.manage(State {
                sessions: Default::default(),
            });

            configure_window(&window);

            #[cfg(target_os = "macos")]
            configure_macos_window(&window);

            app.deep_link().on_open_url(|event| {
                log::info!("deep link URLs: {:?}", event.urls());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // MCP
            commands::get_metadata,
            commands::get_mcp_tools,
            commands::call_mcp_tool,
            commands::start_mcp_server,
            commands::stop_mcp_server,
            // Sessions
            commands::stop_session,
        ])
        .build(tauri::generate_context!())
        .expect("error running Tome");

    app.run(|_, event| {
        if let RunEvent::Exit = event {
            // Ensure we kill every child (and child of child, of child, etc.)
            // MCP server process
            Process::current().kill().unwrap();
        }
    });
}
