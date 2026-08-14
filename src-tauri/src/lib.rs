mod output;
mod shortcut;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(move |app| {
            shortcut::install(app.handle().clone());
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
