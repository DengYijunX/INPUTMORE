import type { TargetContext } from '../output/TextOutputPort';

export type SelectedTextInputDependencies = {
  readClipboard: () => Promise<string>;
  writeClipboard: (text: string) => Promise<void>;
  getClipboardSequence?: () => Promise<number>;
  restoreForeground: (id: string) => Promise<void>;
  sendCopy: () => Promise<void>;
  waitForCopy: () => Promise<void>;
};

export interface SelectedTextInputPort {
  captureSelectedText(target: TargetContext, signal?: AbortSignal): Promise<string | null>;
}

export function createSelectedTextInput(deps: SelectedTextInputDependencies): SelectedTextInputPort {
  return {
    async captureSelectedText(target, signal) {
      if (signal?.aborted) return null;

      const previous = await deps.readClipboard();
      const sequenceBefore = deps.getClipboardSequence ? await deps.getClipboardSequence() : undefined;
      let selected = '';
      try {
        if (signal?.aborted) return null;
        await deps.restoreForeground(target.id);
        if (signal?.aborted) return null;
        await deps.sendCopy();
        await deps.waitForCopy();
        if (signal?.aborted) return null;
        selected = (await deps.readClipboard()).trim();
        const sequenceAfter = deps.getClipboardSequence ? await deps.getClipboardSequence() : undefined;
        if (sequenceBefore !== undefined && sequenceAfter === sequenceBefore) return null;
        return selected && selected !== previous.trim() ? selected : null;
      } finally {
        try {
          const current = await deps.readClipboard();
          if (current !== previous) await deps.writeClipboard(previous);
        } catch {
          // Clipboard restoration is best effort; preserve the original operation error.
        }
      }
    },
  };
}
