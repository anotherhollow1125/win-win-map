use crate::util::Com;
use crate::winapi::WinInfo;
use anyhow::Result;
use crossbeam::channel::{unbounded, Receiver, Sender};
use std::thread::{self, JoinHandle};
use windows::Win32::{
    Foundation::HWND,
    System::Com::{CoCreateInstance, CLSCTX_ALL},
    UI::Shell::{IVirtualDesktopManager, VirtualDesktopManager as VirtualDesktopManager_ID},
};

pub struct VirtualDesktopManager(IVirtualDesktopManager);

impl VirtualDesktopManager {
    pub fn new() -> Result<Self> {
        let virtual_desktop_manager =
            unsafe { CoCreateInstance(&VirtualDesktopManager_ID, None, CLSCTX_ALL)? };
        Ok(Self(virtual_desktop_manager))
    }

    pub fn is_window_on_current_desktop(&self, hwnd: HWND) -> Result<bool> {
        let is_on_current_desktop = unsafe { self.0.IsWindowOnCurrentVirtualDesktop(hwnd)? };
        Ok(is_on_current_desktop.as_bool())
    }

    pub fn filter_thread() -> (JoinHandle<()>, Sender<Vec<WinInfo>>, Receiver<Vec<WinInfo>>) {
        let (input_sender, input_receiver) = unbounded::<Vec<WinInfo>>();
        let (output_sender, output_receiver) = unbounded();

        // 最近考えが改まって来たのだけど、スレッドはunwrapでパニックしてほしい...
        let th = thread::spawn(move || {
            let _com = Com::new().unwrap();
            let vdm = VirtualDesktopManager::new().unwrap();

            while let Ok(wininfo_vec) = input_receiver.recv() {
                let this_disp_vec = wininfo_vec
                    .into_iter()
                    .filter(|wi| vdm.is_window_on_current_desktop(wi.hwnd).unwrap_or(false))
                    .collect::<Vec<_>>();

                output_sender.send(this_disp_vec).unwrap();
            }
        });

        (th, input_sender, output_receiver)
    }
}
