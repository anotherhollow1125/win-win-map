use crate::winapi::structs::WinInfo;
use crate::winapi::virtual_desktop::VirtualDesktopManager as VDM;
use anyhow::{anyhow, Result};
use crossbeam::channel::{Receiver, Sender};
use once_cell::sync::Lazy;
use std::fmt;
use std::sync::Mutex;
use std::thread::JoinHandle as stdJoinHandle;
use windows::{
    core::HSTRING,
    Win32::{
        Foundation::{GetLastError, BOOL, HWND, LPARAM},
        UI::WindowsAndMessaging::{
            EnumWindows, GetForegroundWindow, GetWindowInfo, GetWindowTextW, MoveWindow,
            SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, WS_MINIMIZE, WS_VISIBLE,
        },
    },
};

impl fmt::Display for WinInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let arrow = if self.is_foreground() { ">" } else { " " };
        write!(f, "{} {:?}", arrow, self,)
    }
}

fn judge_active_window(hwnd: HWND) -> Result<Option<WinInfo>> {
    let window_info = unsafe {
        let mut window_info = std::mem::zeroed();
        let true = GetWindowInfo(hwnd, &mut window_info).as_bool() else {
            return Err(anyhow!("Failed to GetWindowInfo: {:?}", GetLastError()));
        };
        window_info
    };

    if window_info.dwStyle & WS_VISIBLE.0 == 0 {
        return Ok(None);
    }
    if window_info.dwStyle & WS_MINIMIZE.0 != 0 {
        return Ok(None);
    }

    let width = window_info.rcWindow.right - window_info.rcWindow.left;
    let height = window_info.rcWindow.bottom - window_info.rcWindow.top;
    if width == 0 || height == 0 {
        return Ok(None);
    }

    let mut window_title = vec![0; 2048];
    let l = unsafe { GetWindowTextW(hwnd, &mut window_title) } as usize;
    let Ok(window_title) = HSTRING::from_wide(&window_title[..l]) else {
        return Ok(None);
    };
    let title = window_title.to_string_lossy();

    if title.len() == 0 {
        return Ok(None);
    }

    Ok(Some(WinInfo {
        hwnd,
        title,
        left: window_info.rcWindow.left,
        top: window_info.rcWindow.top,
        width,
        height,
    }))
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let wininfo_vec = &mut *(lparam.0 as *mut Vec<WinInfo>);

    let window_info = match judge_active_window(hwnd) {
        Ok(Some(window_info)) => window_info,
        Err(e) => {
            eprintln!("Warn: failed to judge_active_window: {}", e);
            return BOOL(1);
        }
        _ => return BOOL(1),
    };

    wininfo_vec.push(window_info);

    BOOL(1)
}

static VDMTH: Lazy<
    Mutex<
        Option<(
            stdJoinHandle<()>,
            Sender<Vec<WinInfo>>,
            Receiver<Vec<WinInfo>>,
        )>,
    >,
> = Lazy::new(|| Mutex::new(Some(VDM::filter_thread())));

impl WinInfo {
    pub fn from_hwnd(hwnd: HWND) -> Result<Option<Self>> {
        judge_active_window(hwnd)
    }

    pub fn move_to(&self, x: i32, y: i32) -> Result<()> {
        unsafe {
            let true = MoveWindow(self.hwnd, x, y, self.width, self.height, true).as_bool() else {
                return Err(anyhow!("Failed to MoveWindow: {:?}", GetLastError()));
            };
        }
        Ok(())
    }

    pub fn resize(&self, width: i32, height: i32) -> Result<()> {
        unsafe {
            let true = MoveWindow(self.hwnd, self.left, self.top, width, height, true).as_bool() else {
                return Err(anyhow!("Failed to MoveWindow: {:?}", GetLastError()));
            };
        }
        Ok(())
    }

    pub fn move_and_resize(&self, x: i32, y: i32, width: i32, height: i32) -> Result<()> {
        unsafe {
            let true = MoveWindow(self.hwnd, x, y, width, height, true).as_bool() else {
                return Err(anyhow!("Failed to MoveWindow: {:?}", GetLastError()));
            };
        }
        Ok(())
    }

    // アクティブにするのではなく、常に最前面に表示されてしまうので注意
    pub fn set_foreground(&self) -> Result<()> {
        unsafe {
            let res = SetWindowPos(self.hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
            if !res.as_bool() {
                return Err(anyhow!("Failed to SetWindowPos: {:?}", GetLastError()));
            }
        }
        Ok(())
    }

    pub fn is_foreground(&self) -> bool {
        let foreground_hwnd = unsafe { GetForegroundWindow() };
        self.hwnd == foreground_hwnd
    }

    pub fn get_windows_info() -> Result<Vec<WinInfo>> {
        let mut wininfo_vec = Vec::new();
        unsafe {
            EnumWindows(
                Some(enum_windows_proc),
                LPARAM(&mut wininfo_vec as *mut _ as _),
            );
        }
        Ok(wininfo_vec)
    }

    pub fn get_windows_info_filtered() -> Result<Vec<WinInfo>> {
        let Ok(vdmth_lock) = VDMTH.lock() else {
            return Err(anyhow!("Failed to lock VDMTH"));
        };
        let Some(vdmth) = &*vdmth_lock else {
            return Err(anyhow!("VDMTH is not initialized"));
        };
        let all_wins = Self::get_windows_info()?;

        vdmth.1.send(all_wins)?;
        let res = vdmth.2.recv()?;

        Ok(res)
    }

    pub fn drop_vdmth() -> Result<()> {
        let Ok(mut vdmth_lock) = VDMTH.lock() else {
            return Ok(());
        };
        let Some((th, tx, rx)) = vdmth_lock.take() else {
            return Ok(());
        };

        drop(tx);
        drop(rx);

        th.join()
            .map_err(|e| anyhow!("Failed to join VDMTH: {:?}", e))?;

        Ok(())
    }
}
