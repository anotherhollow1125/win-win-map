use crate::util::Chan;
use anyhow::{anyhow, Result};
use once_cell::sync::Lazy;
use std::{sync::Mutex, thread::JoinHandle};
use tokio::sync::mpsc::Receiver;
use windows::Win32::{
    Foundation::HWND,
    System::Threading::GetCurrentThreadId,
    UI::Accessibility::{SetWinEventHook, UnhookWinEvent, HWINEVENTHOOK},
    UI::WindowsAndMessaging::{
        DispatchMessageW, GetMessageW, PostThreadMessageW,
        TranslateMessage, /* EVENT_OBJECT_CREATE, */
        EVENT_OBJECT_DESTROY, EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_MOVESIZEEND, MSG, OBJID_WINDOW,
        WINEVENT_OUTOFCONTEXT, WINEVENT_SKIPOWNPROCESS, WM_QUIT,
    },
};

#[derive(Debug)]
pub enum UpdateEvents {
    Active(HWND),
    Move(HWND),
    // Create(HWND),
    Destroy(HWND),
}

static UPDATEEVENTS_CHAN: Lazy<Chan<UpdateEvents>> = Lazy::new(|| Chan::new());
static WINTHID: Mutex<Option<u32>> = Mutex::new(None); // for windows thread id

unsafe extern "system" fn event_hook_proc(
    _h_win_event_hook: HWINEVENTHOOK,
    event: u32,
    hwnd: HWND,
    id_object: i32,
    _id_child: i32,
    _dw_event_thread: u32,
    _dwms_event_time: u32,
) {
    let ue = match event {
        EVENT_SYSTEM_FOREGROUND => UpdateEvents::Active(hwnd),
        EVENT_SYSTEM_MOVESIZEEND => UpdateEvents::Move(hwnd),
        EVENT_OBJECT_DESTROY if id_object == OBJID_WINDOW.0 => UpdateEvents::Destroy(hwnd),
        _ => return,
    };
    let _ = UPDATEEVENTS_CHAN.send(ue);
}

pub fn close_chan() -> Result<()> {
    let Ok(mut id_l) = WINTHID.lock() else {
        return Err(anyhow!("Failed to lock WINTHID"));
    };
    let Some(id) = id_l.take() else {
        return Err(anyhow!("Failed to get WINTHID"));
    };
    unsafe {
        PostThreadMessageW(id, WM_QUIT, None, None);
    }
    UPDATEEVENTS_CHAN.close_and_reset()
}

pub fn init_event_notifier() -> Result<Option<(Receiver<UpdateEvents>, JoinHandle<Result<()>>)>> {
    let Some(recv) = UPDATEEVENTS_CHAN.take_receiver()? else {
        return Ok(None);
    };

    let th = std::thread::spawn(|| unsafe {
        let Ok(mut id_l) = WINTHID.lock() else {
            return Err(anyhow!("Failed to lock WINTHID"));
        };
        *id_l = Some(GetCurrentThreadId());
        drop(id_l);

        let e = SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_OBJECT_DESTROY,
            None,
            Some(event_hook_proc),
            0,
            0,
            WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS,
        );

        if e.is_invalid() {
            return Err(anyhow!("SetWinEventHook failed"));
        }

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, None, 0, 0).as_bool() {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
        let true = UnhookWinEvent(e).as_bool() else {
            return Err(anyhow!("UnhookWinEvent failed"));
        };

        Ok(())
    });

    Ok(Some((recv, th)))
}
