import type { OutputResult, TargetContext, TextOutputPort } from '../../capabilities/output/TextOutputPort';
import { invoke } from '@tauri-apps/api/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

type OutputDependencies = {
  captureForeground: () => Promise<string | null>;
  readClipboard: () => Promise<string>;
  writeClipboard: (text: string) => Promise<void>;
  restoreForeground: (id: string) => Promise<void>;
  sendPaste: () => Promise<void>;
  sendUndo: () => Promise<void>;
  waitForPaste: () => Promise<void>;
};

const toMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const cancelledResult: OutputResult = { ok: false, code: 'cancelled', message: '操作已取消' };
const isCancelled = (signal?: AbortSignal) => signal?.aborted === true;

export function createTextOutput(deps: OutputDependencies): TextOutputPort {
  return {
    async captureTarget() {
      const id = await deps.captureForeground();
      if (!id) throw new Error('没有可用的目标窗口');
      return { id };
    },

    async insertText(text: string, target: TargetContext, signal?: AbortSignal): Promise<OutputResult> {
      if (isCancelled(signal)) return cancelledResult;
      let previous: string;
      let shouldRestoreClipboard = false;
      try {
        previous = await deps.readClipboard();
        if (isCancelled(signal)) return cancelledResult;
      } catch (error) {
        return { ok: false, code: 'clipboard_unavailable', message: toMessage(error) };
      }

      try {
        await deps.writeClipboard(text);
        shouldRestoreClipboard = true;
        if (isCancelled(signal)) return cancelledResult;
        try {
          await deps.restoreForeground(target.id);
        } catch {
          // The target may already be foreground; continue with paste.
        }
        if (isCancelled(signal)) return cancelledResult;
        await deps.sendPaste();
        await deps.waitForPaste();
        if (isCancelled(signal)) return cancelledResult;
        const clipboardAfterPaste = await deps.readClipboard();
        shouldRestoreClipboard = clipboardAfterPaste === text;
        return { ok: true };
      } catch (error) {
        return { ok: false, code: 'paste_failed', message: toMessage(error) };
      } finally {
        if (shouldRestoreClipboard) {
          try {
            await deps.writeClipboard(previous);
          } catch {
            // The result has already been classified; clipboard restoration is best effort.
          }
        }
      }
    },

    async undoText(target: TargetContext, signal?: AbortSignal): Promise<OutputResult> {
      if (isCancelled(signal)) return cancelledResult;
      try {
        try {
          await deps.restoreForeground(target.id);
        } catch {
          // The target may already be foreground; continue with undo.
        }
        if (isCancelled(signal)) return cancelledResult;
        await deps.sendUndo();
        return { ok: true };
      } catch (error) {
        return { ok: false, code: 'paste_failed', message: toMessage(error) };
      }
    },

    async copyText(text: string) {
      await deps.writeClipboard(text);
    },
  };
}

export function createTauriTextOutput(): TextOutputPort {
  return createTextOutput({
    captureForeground: async () => invoke<string | null>('capture_foreground_window'),
    readClipboard: () => readText(),
    writeClipboard: (text) => writeText(text),
    restoreForeground: (id) => invoke('restore_foreground_window', { id }),
    sendPaste: () => invoke('send_paste'),
    sendUndo: () => invoke('send_undo'),
      waitForPaste: () => new Promise((resolve) => window.setTimeout(resolve, 500)),
  });
}
