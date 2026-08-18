use std::ptr::null_mut;
use std::sync::OnceLock;
use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, Emitter};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::VK_RMENU;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetMessageW, KBDLLHOOKSTRUCT, SetWindowsHookExW,
    TranslateMessage, WH_KEYBOARD_LL, WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN,
    WM_SYSKEYUP, MSG,
};

const RIGHT_ALT_VK: u32 = VK_RMENU as u32;
const LLKHF_INJECTED: u32 = 0x10;

static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
static RIGHT_ALT_DOWN: AtomicBool = AtomicBool::new(false);
static CONTROL_DOWN: AtomicBool = AtomicBool::new(false);

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
        if is_control_key(event.vkCode) && should_track_control(event.flags) {
            match wparam as u32 {
                WM_KEYDOWN | WM_SYSKEYDOWN => { CONTROL_DOWN.store(true, Ordering::Release); }
                WM_KEYUP | WM_SYSKEYUP => { CONTROL_DOWN.store(false, Ordering::Release); }
                _ => {}
            }
        }
        if let Some(phase) = phase_for_key_event(event.vkCode, wparam as u32) {
            let should_emit = match phase {
                "pressed" => !RIGHT_ALT_DOWN.swap(true, Ordering::AcqRel),
                "released" => RIGHT_ALT_DOWN.swap(false, Ordering::AcqRel),
                _ => false,
            };
            if !should_emit {
                return CallNextHookEx(null_mut(), code, wparam, lparam);
            }
            let target_window_id = if phase == "pressed" {
                super::output::capture_foreground_window().ok().flatten()
            } else {
                None
            };
            if let Some(app) = APP_HANDLE.get() {
                let _ = app.emit(
                    "inputmore://shortcut",
                    serde_json::json!({
                        "action": if phase == "pressed" { action_for_right_alt(CONTROL_DOWN.load(Ordering::Acquire)) } else { "rawWrite" },
                        "phase": phase,
                        "targetWindowId": target_window_id,
                    }),
                );
            }
        }
    }

    CallNextHookEx(null_mut(), code, wparam, lparam)
}

fn is_control_key(vk_code: u32) -> bool {
    matches!(vk_code, 0x11 | 0xA2 | 0xA3)
}

fn should_track_control(flags: u32) -> bool {
    flags & LLKHF_INJECTED == 0
}

fn action_for_right_alt(control_down: bool) -> &'static str {
    if control_down { "enhance" } else { "rawWrite" }
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
fn should_emit_phase(phase: &str, is_down: &mut bool) -> bool {
    match phase {
        "pressed" if !*is_down => {
            *is_down = true;
            true
        }
        "released" if *is_down => {
            *is_down = false;
            true
        }
        _ => false,
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

    #[test]
    fn suppresses_repeated_right_alt_key_events() {
        let mut is_down = false;
        assert!(super::should_emit_phase("pressed", &mut is_down));
        assert!(!super::should_emit_phase("pressed", &mut is_down));
        assert!(super::should_emit_phase("released", &mut is_down));
        assert!(!super::should_emit_phase("released", &mut is_down));
    }

    #[test]
    fn maps_ctrl_right_alt_to_selected_text_processing() {
        assert_eq!(super::action_for_right_alt(false), "rawWrite");
        assert_eq!(super::action_for_right_alt(true), "enhance");
    }

    #[test]
    fn ignores_injected_keyboard_events_when_tracking_control() {
        assert!(super::should_track_control(0));
        assert!(!super::should_track_control(0x10));
    }
}
