// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(unused_extern_crates)]

mod commands;
mod mcp;
mod migrations;
mod process;
mod state;
mod window;

use process::Process;
use tauri::{Manager, RunEvent};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::migrations::migrations;
use crate::state::State;
use crate::window::configure_window;
#[cfg(target_os = "macos")]
use crate::window::macos::configure_macos_window;
// TODO: Clean if we decide to go with the proxy solution, this code runs but doesn't actually work currently
// #[cfg(target_os = "windows")]
// use webview2_com::WebResourceRequestedEventHandler;
// #[cfg(target_os = "windows")]
// use webview2_com_sys::Microsoft::Web::WebView2::Win32::{
//     ICoreWebView2WebResourceRequest, COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL,
// };
// #[cfg(target_os = "windows")]
// use windows::core::HSTRING;
// #[cfg(target_os = "windows")]
// use std::{env, mem::MaybeUninit};

fn main() {
    if std::env::consts::OS == "windows" {
        std::process::Command::new("setx")
            .args(&["OLLAMA_ORIGINS", "https://tauri.localhost"])
            .output()
            .expect("failed to execute process");
    };

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

            // TODO: Clean if we decide to go with the proxy solution, this code runs but doesn't actually work currently
            // if std::env::consts::OS == "windows" {
            //     let main_webview = app
            //         .get_webview_window("main")
            //         .expect("Couldn't get main webview window");

            //     let _ = main_webview.with_webview(|webview| unsafe {
            //         let core = webview
            //             .controller()
            //             .CoreWebView2()
            //             .expect("Failed to get core web view 2 from controller");
            //         let mut token: MaybeUninit<i64> = MaybeUninit::uninit();

            //         core.AddWebResourceRequestedFilter(
            //             &HSTRING::from("*"),
            //             COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL,
            //         )
            //         .expect("Failed to add web resource requested filter");

            //         let handler = WebResourceRequestedEventHandler::create(Box::new(
            //             move |_webview, args| {
            //                 if let Some(args) = args {
            //                     let request: ICoreWebView2WebResourceRequest =
            //                         args.Request().expect("Failed to get request");

            //                     request
            //                         .Headers()
            //                         .unwrap()
            //                         .SetHeader(
            //                             &HSTRING::from("Origin"),
            //                             &HSTRING::from("http://localhost"),
            //                         )
            //                         .expect("Failed to set Origin");
            //                     request
            //                         .Headers()
            //                         .unwrap()
            //                         .SetHeader(
            //                             &HSTRING::from("Referer"),
            //                             &HSTRING::from("http://localhost"),
            //                         )
            //                         .expect("Failed to set Referer");
            //                 }
            //                 Ok(())
            //             },
            //         ));
            //         core.add_WebResourceRequested(&handler, token.as_mut_ptr())
            //             .expect("Failed to add web resource requested event handler");
            //     });
            // };

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

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(mcp::bootstrap(handle));

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
            // Requests
            commands::proxy_request,
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
