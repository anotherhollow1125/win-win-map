use crate::winapi::structs::Canvas;
use anyhow::Result;
use windows::Win32::{
    Foundation::{BOOL, LPARAM, RECT},
    Graphics::Gdi::{EnumDisplayMonitors, HDC, HMONITOR},
};

unsafe extern "system" fn monitor_enum_proc(
    _p0: HMONITOR,
    _p1: HDC,
    rect: *mut RECT,
    v: LPARAM,
) -> BOOL {
    let rect_vec = &mut *(v.0 as *mut Vec<RECT>);
    rect_vec.push(*rect);

    BOOL(1)
}

pub fn get_monitors_rect() -> Result<Vec<RECT>> {
    let mut rect_vec = Vec::new();
    unsafe {
        EnumDisplayMonitors(
            None,
            None,
            Some(monitor_enum_proc),
            LPARAM(&mut rect_vec as *mut _ as _),
        );
    }
    Ok(rect_vec)
}

pub(crate) fn get_canvas() -> Result<Canvas> {
    let monitors = get_monitors_rect()?;
    // キモチワルク見えるかもしれないけど繰り返し回数は最小
    // それに可読性は何も問題ない
    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;
    for monitor in &monitors {
        min_x = min_x.min(monitor.left);
        min_y = min_y.min(monitor.top);
        max_x = max_x.max(monitor.right);
        max_y = max_y.max(monitor.bottom);
    }

    Ok(Canvas {
        min_x,
        min_y,
        max_x,
        max_y,
        monitors,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_monitors_rect() {
        let _monitors = get_monitors_rect().unwrap();
    }

    #[test]
    fn test_canvas() {
        let _canvas = Canvas::new().unwrap();
    }
}
