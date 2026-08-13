import { describe, expect, it } from 'vitest';
import { RealtimeTranscriptionSession } from './RealtimeTranscriptionSession';

describe('RealtimeTranscriptionSession', () => {
  it('forwards audio chunks and returns only the final result', async () => {
    const calls: string[] = [];
    const session = new RealtimeTranscriptionSession({
      start: async () => { calls.push('start'); },
      pushChunk: async (chunk) => { calls.push(`chunk:${chunk.byteLength}`); },
      finish: async () => { calls.push('finish'); return { text: '最终文本' }; },
      cancel: async () => { calls.push('cancel'); },
    });

    await session.start();
    await session.pushChunk(new Uint8Array([1, 2, 3]));
    const result = await session.finish();

    expect(calls).toEqual(['start', 'chunk:3', 'finish']);
    expect(result).toEqual({ text: '最终文本' });
  });

  it('cancels the active session and prevents subsequent chunks', async () => {
    const pushChunk = async () => { throw new Error('must not push after cancel'); };
    const session = new RealtimeTranscriptionSession({
      start: async () => {}, pushChunk, finish: async () => ({ text: '' }), cancel: async () => {},
    });

    await session.start();
    await session.cancel();

    await expect(session.pushChunk(new Uint8Array([1]))).rejects.toThrow('会话已取消');
  });
});
