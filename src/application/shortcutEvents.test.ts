import { expect, it } from 'vitest';
import { DEFAULT_ENHANCE_SHORTCUT, toSessionEvent } from './shortcutEvents';

it('uses a visible development shortcut for optimized transcription', () => {
  expect(DEFAULT_ENHANCE_SHORTCUT).toBe('Ctrl+Shift+Space');
});

it('turns the second shortcut press into a recording stop event', () => {
  expect(toSessionEvent({ action: 'enhance', phase: 'released' }, true)).toEqual({
    type: 'recording_stopped',
    audioId: 'pending-audio',
  });
});

it('keeps the target window captured at shortcut time', () => {
  expect(toSessionEvent({ action: 'enhance', phase: 'pressed', targetWindowId: 'window-1' }, false)).toEqual({
    type: 'shortcut',
    action: 'enhance',
    durationMs: 0,
    targetWindowId: 'window-1',
  });
});
