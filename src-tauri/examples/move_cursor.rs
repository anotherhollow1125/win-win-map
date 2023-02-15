use anyhow::Result;
use win_win_map::winapi::mouse::set_cursor_pos;

fn main() -> Result<()> {
    set_cursor_pos(10, 10)?;

    Ok(())
}
