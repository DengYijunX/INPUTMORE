import { describe, expect, it } from 'vitest';
import { createSelectedTextInput } from './SelectedTextInputPort';

describe('selected text input', () => {
  it('reads selected text through copy and restores the previous clipboard', async () => {
    let clipboard = '原剪贴板';
    const input = createSelectedTextInput({
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; },
      restoreForeground: async () => undefined,
      sendCopy: async () => { clipboard = '选中的文字'; },
      waitForCopy: async () => undefined,
    });

    await expect(input.captureSelectedText({ id: 'window-1' })).resolves.toBe('选中的文字');
    expect(clipboard).toBe('原剪贴板');
  });

  it('returns no selection when copying leaves the clipboard unchanged', async () => {
    let clipboard = '原剪贴板';
    const input = createSelectedTextInput({
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; },
      restoreForeground: async () => undefined,
      sendCopy: async () => undefined,
      waitForCopy: async () => undefined,
    });

    await expect(input.captureSelectedText({ id: 'window-1' })).resolves.toBeNull();
    expect(clipboard).toBe('原剪贴板');
  });

  it('restores the previous clipboard when copying fails', async () => {
    let clipboard = '原剪贴板';
    const input = createSelectedTextInput({
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; },
      restoreForeground: async () => undefined,
      sendCopy: async () => {
        clipboard = '临时内容';
        throw new Error('复制失败');
      },
      waitForCopy: async () => undefined,
    });

    await expect(input.captureSelectedText({ id: 'window-1' })).rejects.toThrow('复制失败');
    expect(clipboard).toBe('原剪贴板');
  });
});
