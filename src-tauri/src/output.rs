#[tauri::command]
pub fn capture_foreground_window() -> Result<Option<String>, String> {
    #[cfg(windows)]
    {
        use std::ptr::null_mut;
        use windows_sys::Win32::UI::WindowsAndMessaging::GetForegroundWindow;
        let hwnd = unsafe { GetForegroundWindow() };
        if hwnd == null_mut() {
            Ok(None)
        } else {
            Ok(Some(format!("{}", hwnd as usize)))
        }
    }

    #[cfg(not(windows))]
    {
        Err("当前平台暂不支持系统级输入写回".to_string())
    }
}

#[tauri::command]
pub fn get_clipboard_sequence() -> Result<u32, String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::System::DataExchange::GetClipboardSequenceNumber;
        Ok(unsafe { GetClipboardSequenceNumber() })
    }

    #[cfg(not(windows))]
    {
        Err("当前平台暂不支持读取剪贴板序列号".to_string())
    }
}

#[tauri::command]
pub fn restore_foreground_window(id: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::Foundation::HWND;
        use windows_sys::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, SetForegroundWindow};
        let hwnd = id.parse::<isize>().map_err(|_| "目标窗口句柄无效".to_string())? as HWND;
        let restored = unsafe { SetForegroundWindow(hwnd) };
        if restored == 0 || unsafe { GetForegroundWindow() } != hwnd {
            Err("无法恢复目标窗口焦点".to_string())
        } else {
            Ok(())
        }
    }

    #[cfg(not(windows))]
    {
        let _ = id;
        Err("当前平台暂不支持系统级输入写回".to_string())
    }
}

#[tauri::command]
pub fn send_paste() -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::mem::size_of;
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_0, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_V,
        };

        let inputs = [
            INPUT {
                r#type: 1,
                Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } },
            },
            INPUT {
                r#type: 1,
                Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_V as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } },
            },
            INPUT {
                r#type: 1,
                Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_V as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } },
            },
            INPUT {
                r#type: 1,
                Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } },
            },
        ];

        let sent = unsafe { SendInput(inputs.len() as u32, inputs.as_ptr(), size_of::<INPUT>() as i32) };
        if sent == inputs.len() as u32 {
            Ok(())
        } else {
            Err("无法发送粘贴输入".to_string())
        }
    }

    #[cfg(not(windows))]
    {
        Err("当前平台暂不支持系统级输入写回".to_string())
    }
}

#[tauri::command]
pub fn send_copy() -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::mem::size_of;
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_0, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_C,
        };

        let inputs = [
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_C as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_C as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } } },
        ];

        let sent = unsafe { SendInput(inputs.len() as u32, inputs.as_ptr(), size_of::<INPUT>() as i32) };
        if sent == inputs.len() as u32 { Ok(()) } else { Err("无法发送复制输入".to_string()) }
    }

    #[cfg(not(windows))]
    {
        Err("当前平台暂不支持系统级复制".to_string())
    }
}

#[tauri::command]
pub fn send_undo() -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::mem::size_of;
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_0, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_Z,
        };

        let inputs = [
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_Z as u16, wScan: 0, dwFlags: 0, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_Z as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } } },
            INPUT { r#type: 1, Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VK_CONTROL as u16, wScan: 0, dwFlags: KEYEVENTF_KEYUP, time: 0, dwExtraInfo: 0 } } },
        ];

        let sent = unsafe { SendInput(inputs.len() as u32, inputs.as_ptr(), size_of::<INPUT>() as i32) };
        if sent == inputs.len() as u32 { Ok(()) } else { Err("无法发送撤回输入".to_string()) }
    }

    #[cfg(not(windows))]
    {
        Err("当前平台暂不支持系统级撤回".to_string())
    }
}
