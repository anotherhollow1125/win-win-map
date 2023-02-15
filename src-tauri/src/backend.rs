use crate::winapi::winevents::{init_event_notifier, UpdateEvents};
use anyhow::{anyhow, Result};
use std::thread;
use tauri::{App, Manager, Wry};
use tokio::sync::mpsc::Receiver;
use tokio::task;

pub fn prepare() -> Result<(Receiver<UpdateEvents>, thread::JoinHandle<Result<()>>)> {
    let Some((rx, th)) = init_event_notifier()? else {
        return Err(anyhow!("init_event_notifier already initialized"));
    };

    Ok((rx, th))
}

#[derive(serde::Serialize, Clone)]
struct UpdateEventsPayload {
    kind: String,
    hwnd: u64,
}

pub fn tauri_setup(app: &mut App<Wry>, mut rx: Receiver<UpdateEvents>) -> task::JoinHandle<()> {
    let main_window = app.get_window("main").unwrap();

    let mw = main_window.clone();
    let notification_thread = tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            let payload = match event {
                UpdateEvents::Active(hwnd) => UpdateEventsPayload {
                    kind: "active".to_string(),
                    hwnd: hwnd.0 as _,
                },
                UpdateEvents::Move(hwnd) => UpdateEventsPayload {
                    kind: "move".to_string(),
                    hwnd: hwnd.0 as _,
                },
                UpdateEvents::Destroy(hwnd) => UpdateEventsPayload {
                    kind: "destroy".to_string(),
                    hwnd: hwnd.0 as _,
                },
            };
            if let Err(e) = mw.emit("update", payload) {
                log::error!("{:?}", e);
            }
        }
    });

    notification_thread
}
