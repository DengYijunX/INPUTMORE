use std::ptr::null_mut;
use std::sync::OnceLock;

use tauri::{AppHandle, Emitter};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::VK_RMENU;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, KBDLLHOOKSTRUCT, SetWindowsHookExW,
    TranslateMessage, WH_KEYBOARD_LL, WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN,
    WM_SYSKEYUP, MSG,
};

const RIGHT_ALT_VK: u32 = VK_RMENU as u32;

static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

pub fn install(app: AppHandle) {
    let _ = APP_HANDLE.set(app);
    std::thread::spawn(|| unsafe {
        let hook = SetWindowsHookExW(WH_KEYBOARD_LL, Some(keyboard_proc), null_mut(), 0);
        if hook.is_null() {
            return;
        }

        let mut message = MSG {
            hwnd: null_mut(),
            message: 0,
            wParam: 0,
            lParam: 0,
            time: 0,
            pt: windows_sys::Win32::Foundation::POINT { x: 0, y: 0 },
        };
        while GetMessageW(&mut message, null_mut(), 0, 0) > 0 {
            TranslateMessage(&message);
            DispatchMessageW(&message);
        }
    });
}

unsafe extern "system" fn keyboard_proc(
    code: i32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    if code >= 0 && lparam != 0 {
        let event = &*(lparam as *const KBDLLHOOKSTRUCT);
        if let Some(phase) = phase_for_key_event(event.vkCode, wparam as u32) {
            let target_window_id = if phase == "pressed" {
                super::output::capture_foreground_window().ok().flatten()
            } else {
                None
            };
            if let Some(app) = APP_HANDLE.get() {
                let _ = app.emit(
                    "inputmore://shortcut",
                    serde_json::json!({
                        "action": "enhance",
                        "phase": phase,
                        "targetWindowId": target_window_id,
                    }),
                );
            }
        }
    }

    CallNextHookEx(null_mut(), code, wparam, lparam)
}

fn phase_for_key_event(vk_code: u32, message: u32) -> Option<&'static str> {
    if vk_code != RIGHT_ALT_VK {
        return None;
    }
    match message {
        WM_KEYDOWN | WM_SYSKEYDOWN => Some("pressed"),
        WM_KEYUP | WM_SYSKEYUP => Some("released"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn maps_only_right_alt_key_events_to_toggle_phases() {
        assert_eq!(super::phase_for_key_event(0xA5, 0x0104), Some("pressed"));
        assert_eq!(super::phase_for_key_event(0xA5, 0x0105), Some("released"));
        assert_eq!(super::phase_for_key_event(0xA4, 0x0104), None);
    }
}
