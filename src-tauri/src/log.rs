use env_logger::fmt::Color;
use log::Level::*;
use std::io::Write;

pub fn env_logger_init() {
    env_logger::builder()
        .format(|buf, record| {
            let mut level_style = buf.style();
            let color = match record.level() {
                Error => Color::Red,
                Warn => Color::Yellow,
                Info => Color::Green,
                Debug => Color::Blue,
                Trace => Color::Magenta,
            };
            level_style.set_color(color).set_bold(true);

            let ts = buf.timestamp();
            writeln!(
                buf,
                "[{} {} {} @{}:{}] {}",
                ts,
                level_style.value(record.level()),
                record.target(),
                record.file().unwrap_or("*"),
                record.line().unwrap_or(0),
                record.args(),
            )
        })
        .init();
}
