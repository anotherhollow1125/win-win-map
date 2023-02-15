use anyhow::{anyhow, Result};
use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;

pub fn set_cursor_pos(x: i32, y: i32) -> Result<()> {
    let result = unsafe { SetCursorPos(x, y) };
    if result.as_bool() {
        Ok(())
    } else {
        Err(anyhow!("SetCursorPos failed"))
    }
}
