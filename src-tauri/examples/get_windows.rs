use anyhow::Result;
use win_win_map::util::Com;
use win_win_map::winapi::virtual_desktop::VirtualDesktopManager;
use win_win_map::winapi::WinInfo;

fn main() -> Result<()> {
    let _com = Com::new()?;
    let vdm = VirtualDesktopManager::new()?;
    let wininfo_vec = WinInfo::get_windows_info()?;

    for wininfo in wininfo_vec {
        let this_disp = vdm.is_window_on_current_desktop(wininfo.hwnd)?;
        let sign = if this_disp { " " } else { "~" };
        println!("{}{:?}", sign, wininfo);
    }

    println!("====================");

    let this_display_windows = WinInfo::get_windows_info_filtered()?;

    for wininfo in this_display_windows {
        println!("  {:?}", wininfo);
    }

    WinInfo::drop_vdmth()?;

    Ok(())
}
