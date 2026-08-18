import { invoke } from '@tauri-apps/api/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { createSelectedTextInput, type SelectedTextInputPort } from '../../capabilities/input/SelectedTextInputPort';

export function createTauriSelectedTextInput(): SelectedTextInputPort {
  return createSelectedTextInput({
    readClipboard: () => readText(),
    writeClipboard: (text) => writeText(text),
    getClipboardSequence: () => invoke<number>('get_clipboard_sequence'),
    restoreForeground: (id) => invoke('restore_foreground_window', { id }),
    sendCopy: () => invoke('send_copy'),
    waitForCopy: () => new Promise((resolve) => window.setTimeout(resolve, 120)),
  });
}
