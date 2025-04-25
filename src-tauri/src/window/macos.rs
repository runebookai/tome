use cocoa::appkit::{NSColor, NSWindow};
use cocoa::appkit::{NSWindowStyleMask, NSWindowTitleVisibility};
use cocoa::base::{id, nil};
use tauri::{TitleBarStyle, Window};

pub fn configure_macos_window(window: &Window) {
    window
        .set_title_bar_style(TitleBarStyle::Transparent)
        .expect("Cannot set titlebar style to transparent");

    unsafe {
        let ns_window = window.ns_window().unwrap() as id;
        let mut style_mask = ns_window.styleMask();

        style_mask.set(NSWindowStyleMask::NSBorderlessWindowMask, true);
        style_mask.set(NSWindowStyleMask::NSFullSizeContentViewWindowMask, true);

        ns_window.setStyleMask_(style_mask);
        ns_window.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);
        ns_window.setTitlebarAppearsTransparent_(true);

        ns_window.setBackgroundColor_(NSColor::colorWithRed_green_blue_alpha_(
            nil,
            11.0 / 255.0,
            11.0 / 255.0,
            11.0 / 255.0,
            1.0,
        ));
    }
}
