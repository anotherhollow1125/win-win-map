use anyhow::Result;
use dialoguer::{console::Term, theme::ColorfulTheme, Select};
use win_win_map::util::Com;
use win_win_map::winapi::virtual_desktop::VirtualDesktopManager;
use win_win_map::winapi::WinInfo;

fn main() -> Result<()> {
    let _com = Com::new()?;
    let vdm = VirtualDesktopManager::new()?;
    let wininfo_vec = WinInfo::get_windows_info()?
        .into_iter()
        .filter(|wi| vdm.is_window_on_current_desktop(wi.hwnd).unwrap_or(false))
        .collect::<Vec<_>>();

    let selection = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("Select a window")
        .items(&wininfo_vec)
        .default(0)
        .interact_on_opt(&Term::stderr())
        .unwrap();

    match selection {
        Some(i) => {
            let wi = &wininfo_vec[i];
            println!("Move and Resize {} to (20, 20, 200, 100)", wi);
            wi.move_and_resize(20, 20, 200, 100)?;
            // wi.set_foreground()?;
        }
        None => {
            println!("No window selected");
        }
    }

    Ok(())
}
