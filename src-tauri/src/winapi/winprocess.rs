use anyhow::{anyhow, Result};
use windows::{
    core::PWSTR,
    Win32::{
        Foundation::{CloseHandle, GetLastError, HANDLE, HWND},
        System::Threading::{
            OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
            PROCESS_QUERY_LIMITED_INFORMATION,
        },
        UI::WindowsAndMessaging::GetWindowThreadProcessId,
    },
};

struct ProcessHandle {
    inner: HANDLE,
}

impl ProcessHandle {
    fn new(pid: u32) -> Result<Self> {
        let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) }?;

        Ok(Self { inner: handle })
    }

    fn get_exe_name(&self) -> Result<String> {
        let mut v = vec![0; 2048];
        let buffer = PWSTR::from_raw(v.as_mut_ptr());
        let mut size = v.len() as u32;
        let res = unsafe {
            QueryFullProcessImageNameW(
                self.inner,
                PROCESS_NAME_FORMAT(0),
                buffer,
                (&mut size) as *mut _,
            )
        }
        .as_bool();

        if !res {
            return Err(anyhow!(
                "Failed to QueryFullProcessImageNameW: {:?}",
                unsafe { GetLastError() }
            ));
        }

        Ok(unsafe { buffer.to_string() }?)
    }
}

impl Drop for ProcessHandle {
    fn drop(&mut self) {
        unsafe { CloseHandle(self.inner) };
    }
}

pub fn get_exe_name(hwnd: HWND) -> Result<String> {
    let mut process_id: u32 = 0;

    let _ = unsafe { GetWindowThreadProcessId(hwnd, Some((&mut process_id) as *mut _)) };
    let handle = ProcessHandle::new(process_id)?;
    handle.get_exe_name()
}
