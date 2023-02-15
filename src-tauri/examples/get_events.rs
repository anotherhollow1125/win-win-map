use anyhow::{anyhow, Result};
use std::collections::HashMap;
use win_win_map::winapi::{
    winevents::{close_chan, init_event_notifier, UpdateEvents},
    WinInfo,
};
// use std::process::exit;

#[tokio::main]
async fn main() -> Result<()> {
    let mut windows = WinInfo::get_windows_info()?
        .into_iter()
        .map(|win| (win.hwnd.0, win))
        .collect::<HashMap<isize, WinInfo>>();

    let Ok(Some((mut receiver, th))) = init_event_notifier() else {
        return Err(anyhow!("init_event_notifier failed"));
    };

    ctrlc::set_handler(move || {
        let _ = close_chan();
        println!("Ctrl-C pressed, exiting...");
    })
    .expect("Error setting Ctrl-C handler");

    while let Some(event) = receiver.recv().await {
        match event {
            UpdateEvents::Active(hwnd) => {
                let win = match windows.get(&hwnd.0) {
                    Some(win) => win,
                    None => {
                        let Ok(Some(wininfo)) = WinInfo::from_hwnd(hwnd) else { continue };
                        windows.insert(hwnd.0, wininfo);
                        windows.get(&hwnd.0).unwrap()
                    }
                };
                println!("Active: {}", win.title);
            }
            UpdateEvents::Move(hwnd) => {
                let Some(win) = windows.get(&hwnd.0) else { continue };
                println!("Move: {}", win.title);
            }
            UpdateEvents::Destroy(hwnd) => {
                let Some(win) = windows.get(&hwnd.0) else { continue };
                println!("Destroy: {}", win.title);
            }
        }
    }

    th.join().map_err(|_| anyhow!("thread join failed"))??;

    Ok(())
}
