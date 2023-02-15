#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use anyhow::Result;
use tauri::WindowEvent;
use win_win_map::backend;
use win_win_map::log::env_logger_init;
use win_win_map::winapi::{mouse, winevents, Canvas, WinInfo};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn get_canvas() -> Result<Canvas, String> {
    Canvas::new().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_windows() -> Result<Vec<WinInfo>, String> {
    WinInfo::get_windows_info_filtered().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_cursor_pos(x: i32, y: i32) -> Result<(), String> {
    mouse::set_cursor_pos(x, y).map_err(|e| e.to_string())
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();
    tauri::async_runtime::set(tokio::runtime::Handle::current());
    env_logger_init();

    let (rx, th) = backend::prepare()?;

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_canvas,
            get_windows,
            set_cursor_pos
        ])
        .setup(|app| {
            let _notification_thread = backend::tauri_setup(app, rx);

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { .. } => {
                let close_chan_res = winevents::close_chan();
                let drop_vdmth_res = WinInfo::drop_vdmth();
                println!(
                    "CloseRequested, exiting...: {:?} {:?}",
                    close_chan_res, drop_vdmth_res
                );
            }
            _ => {}
        })
        .run(tauri::generate_context!())?;

    match th.join() {
        Ok(Ok(())) => (),
        Ok(Err(e)) => log::error!("join th: {}", e),
        Err(e) => log::error!("join th: {:?}", e),
    }

    Ok(())
}
