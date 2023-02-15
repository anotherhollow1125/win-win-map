use anyhow::Result;
use win_win_map::winapi::Canvas;

fn main() -> Result<()> {
    let canvas = Canvas::new()?;

    println!("{:?}", canvas);

    Ok(())
}
