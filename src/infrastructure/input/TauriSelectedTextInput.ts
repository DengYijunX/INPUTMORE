import { invoke } from '@tauri-apps/api/core';
import type { SelectedTextInputPort } from '../../capabilities/input/SelectedTextInputPort';

export function createTauriSelectedTextInput(): SelectedTextInputPort {
  return {
    async captureSelectedText(target, signal) {
      if (signal?.aborted) return null;
      const selected = await invoke<string | null>('capture_selected_text', { targetWindowId: target.id });
      if (signal?.aborted) return null;
      return selected;
    },
  };
}
