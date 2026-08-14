import { describe, expect, it } from 'vitest';
import { reduce } from './sessionMachine';
import type { SessionState } from '../domain/actions';

describe('session machine', () => {
  it('starts recording for the default action', () => {
    const state: SessionState = { tag: 'idle' };
    expect(reduce(state, { type: 'shortcut', action: 'enhance', durationMs: 0 })).toMatchObject({
      tag: 'recording',
      action: 'enhance',
    });
  });

  it('transitions from recording to transcription', () => {
    const state: SessionState = { tag: 'recording', action: 'enhance', startedAt: 10 };
    expect(reduce(state, { type: 'recording_stopped', audioId: 'audio-1' })).toEqual({
      tag: 'transcribing',
      action: 'enhance',
      audioId: 'audio-1',
    });
  });

  it('routes completed enhance work to write-back', () => {
    const state: SessionState = { tag: 'processing', action: 'enhance', requestId: 'req-1' };
    expect(reduce(state, { type: 'result_ready', text: '整理后的文本' })).toEqual({
      tag: 'writingBack',
      action: 'enhance',
      text: '整理后的文本',
    });
  });

  it('routes completed Ask work to the answer view', () => {
    const state: SessionState = { tag: 'processing', action: 'ask', requestId: 'req-2' };
    expect(reduce(state, { type: 'result_ready', text: '答案' })).toEqual({
      tag: 'showingAnswer',
      text: '答案',
      requestId: 'req-2',
    });
  });

  it('cancels every cancellable state back to idle', () => {
    const states: SessionState[] = [
      { tag: 'recording', action: 'enhance', startedAt: 10 },
      { tag: 'transcribing', action: 'translate', audioId: 'audio-1' },
      { tag: 'processing', action: 'ask', requestId: 'req-1' },
      { tag: 'writingBack', action: 'enhance', text: '结果' },
    ];

    for (const state of states) {
      expect(reduce(state, { type: 'escape' })).toEqual({ tag: 'idle' });
    }
  });

  it('completes a successful write-back', () => {
    expect(reduce(
      { tag: 'writingBack', action: 'enhance', text: '结果' },
      { type: 'writeback_succeeded', undoId: 'undo-1' },
    )).toEqual({ tag: 'completed', action: 'enhance', undoId: 'undo-1' });
  });

  it('returns to idle after the completed feedback window', () => {
    expect(reduce(
      { tag: 'completed', action: 'enhance', undoId: 'undo-1' },
      { type: 'reset' },
    )).toEqual({ tag: 'idle' });
  });

  it('preserves a retryable failure', () => {
    const state: SessionState = { tag: 'processing', action: 'translate', requestId: 'req-3' };
    expect(reduce(state, {
      type: 'failed',
      message: '模型请求失败',
      retryable: true,
    })).toEqual({
      tag: 'error',
      action: 'translate',
      message: '模型请求失败',
      retryable: true,
    });
  });
});
