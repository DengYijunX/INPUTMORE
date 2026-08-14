use tauri::Emitter;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

mod output;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let enhance_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &enhance_shortcut {
                        let phase = match event.state() {
                            ShortcutState::Pressed => "pressed",
                            ShortcutState::Released => "released",
                        };
                        let target_window_id = if phase == "pressed" {
                            output::capture_foreground_window().ok().flatten()
                        } else {
                            None
                        };
                        let _ = app.emit("inputmore://shortcut", serde_json::json!({
                            "action": "enhance",
                            "phase": phase,
                            "targetWindowId": target_window_id,
                        }));
                    }
                })
                .build(),
        )
        .setup(move |app| {
            app.global_shortcut().register(enhance_shortcut)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            output::capture_foreground_window,
            output::restore_foreground_window,
            output::send_paste,
            output::send_undo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running inputmore application");
}
