use crate::winapi::monitors::get_canvas;
use anyhow::Result;
use serde::ser::{Serialize, SerializeStruct, Serializer};
use windows::Win32::Foundation::{HWND, RECT};

#[derive(Debug, Clone)]
pub struct WinInfo {
    pub hwnd: HWND,
    pub title: String,
    pub left: i32,
    pub top: i32,
    pub width: i32,
    pub height: i32,
}

impl Serialize for WinInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let is_foreground = self.is_foreground();
        let mut state = serializer.serialize_struct("WinInfo", 6)?;
        state.serialize_field("hwnd", &self.hwnd.0)?;
        state.serialize_field("title", &self.title)?;
        state.serialize_field("left", &self.left)?;
        state.serialize_field("top", &self.top)?;
        state.serialize_field("width", &self.width)?;
        state.serialize_field("height", &self.height)?;
        state.serialize_field("is_foreground", &is_foreground)?;
        state.end()
    }
}

#[derive(Debug)]
pub struct Canvas {
    pub min_x: i32,
    pub min_y: i32,
    pub max_x: i32,
    pub max_y: i32,
    pub monitors: Vec<RECT>,
}

impl Canvas {
    pub fn new() -> Result<Self> {
        get_canvas()
    }

    pub fn width(&self) -> i32 {
        self.max_x - self.min_x
    }

    pub fn height(&self) -> i32 {
        self.max_y - self.min_y
    }
}

#[derive(serde::Serialize)]
struct JSRect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

impl Serialize for Canvas {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("Canvas", 5)?;
        state.serialize_field("min_x", &self.min_x)?;
        state.serialize_field("min_y", &self.min_y)?;
        state.serialize_field("max_x", &self.max_x)?;
        state.serialize_field("max_y", &self.max_y)?;

        let monitors = self
            .monitors
            .iter()
            .map(|rect| JSRect {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
            })
            .collect::<Vec<_>>();

        state.serialize_field("monitors", &monitors)?;

        state.end()
    }
}
