import { describe, expect, it } from 'vitest';
import { createTextOutput } from './TauriTextOutput';

describe('TauriTextOutput', () => {
  it('does not write or paste when the operation was cancelled before it started', async () => {
    const calls: string[] = [];
    const controller = new AbortController();
    controller.abort();
    const adapter = createTextOutput({
      captureForeground: async () => 'window-1',
      readClipboard: async () => { calls.push('read'); return '用户原剪贴板'; },
      writeClipboard: async () => { calls.push('clipboard'); },
      restoreForeground: async () => { calls.push('focus'); },
      sendPaste: async () => { calls.push('paste'); },
      sendUndo: async () => undefined,
      waitForPaste: async () => undefined,
    });

    await expect(adapter.insertText('整理结果', { id: 'window-1' }, controller.signal)).resolves.toEqual({
      ok: false,
      code: 'cancelled',
      message: '操作已取消',
    });
    expect(calls).toEqual([]);
  });

  it('restores clipboard after a successful paste', async () => {
    const calls: string[] = [];
    let clipboard = '用户原剪贴板';
    const adapter = createTextOutput({
      captureForeground: async () => { calls.push('capture'); return 'window-1'; },
      readClipboard: async () => { calls.push('read'); return clipboard; },
      writeClipboard: async (text) => { clipboard = text; calls.push(`clipboard:${text}`); },
      restoreForeground: async () => { calls.push('focus'); },
      sendPaste: async () => { calls.push('paste'); },
      sendUndo: async () => { calls.push('undo'); },
      waitForPaste: async () => { calls.push('wait'); },
    });

    const target = await adapter.captureTarget();
    expect(await adapter.insertText('整理结果', target)).toEqual({ ok: true });
    expect(calls).toEqual(['capture', 'read', 'clipboard:整理结果', 'focus', 'paste', 'wait', 'read', 'clipboard:用户原剪贴板']);
  });

  it('does not overwrite clipboard content changed by the user during paste', async () => {
    const calls: string[] = [];
    let clipboard = '用户原剪贴板';
    const adapter = createTextOutput({
      captureForeground: async () => 'window-1',
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; calls.push(`clipboard:${text}`); },
      restoreForeground: async () => undefined,
      sendPaste: async () => { clipboard = '用户后来复制的内容'; },
      sendUndo: async () => undefined,
      waitForPaste: async () => undefined,
    });

    await adapter.insertText('整理结果', { id: 'window-1' });
    expect(calls).toEqual(['clipboard:整理结果']);
    expect(clipboard).toBe('用户后来复制的内容');
  });

  it('restores clipboard when paste fails', async () => {
    const calls: string[] = [];
    let clipboard = '用户原剪贴板';
    const adapter = createTextOutput({
      captureForeground: async () => 'window-1',
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; calls.push(`clipboard:${text}`); },
      restoreForeground: async () => { calls.push('focus'); },
      sendPaste: async () => { calls.push('paste'); throw new Error('目标窗口不可用'); },
      sendUndo: async () => { calls.push('undo'); },
      waitForPaste: async () => { calls.push('wait'); },
    });

    const target = await adapter.captureTarget();
    expect(await adapter.insertText('整理结果', target)).toMatchObject({ ok: false, code: 'paste_failed' });
    expect(calls).toEqual(['clipboard:整理结果', 'focus', 'paste', 'clipboard:用户原剪贴板']);
  });

  it('does not paste when focus restoration reports an error', async () => {
    const calls: string[] = [];
    let clipboard = '用户原剪贴板';
    const adapter = createTextOutput({
      captureForeground: async () => 'window-1',
      readClipboard: async () => clipboard,
      writeClipboard: async (text) => { clipboard = text; calls.push(`clipboard:${text}`); },
      restoreForeground: async () => { calls.push('focus'); throw new Error('目标窗口已在前台'); },
      sendPaste: async () => { calls.push('paste'); },
      sendUndo: async () => { calls.push('undo'); },
      waitForPaste: async () => { calls.push('wait'); },
    });

    const target = await adapter.captureTarget();
    expect(await adapter.insertText('整理结果', target)).toMatchObject({ ok: false, code: 'target_unavailable' });
    expect(calls).toEqual(['clipboard:整理结果', 'focus', 'clipboard:用户原剪贴板']);
  });

  it('undoes the last write in the original target window', async () => {
    const calls: string[] = [];
    const adapter = createTextOutput({
      captureForeground: async () => 'window-1',
      readClipboard: async () => '用户原剪贴板',
      writeClipboard: async () => undefined,
      restoreForeground: async (id) => { calls.push(`focus:${id}`); },
      sendPaste: async () => undefined,
      sendUndo: async () => { calls.push('undo'); },
      waitForPaste: async () => undefined,
    });

    await expect(adapter.undoText({ id: 'window-1' })).resolves.toEqual({ ok: true });
    expect(calls).toEqual(['focus:window-1', 'undo']);
  });
});
