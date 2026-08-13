import { describe, expect, it } from 'vitest';
import type { OutputResult, TargetContext, TextOutputPort } from './TextOutputPort';

describe('TextOutputPort contract', () => {
  it('describes a captured target and successful insertion', async () => {
    const target: TargetContext = { id: 'window-1' };
    const output: TextOutputPort = {
      captureTarget: async () => target,
      insertText: async () => ({ ok: true, undoId: 'window-1:1' } satisfies OutputResult),
      copyText: async () => undefined,
    };

    expect(await output.captureTarget()).toEqual(target);
    expect(await output.insertText('整理后的文本', target)).toEqual({ ok: true, undoId: 'window-1:1' });
  });
});
