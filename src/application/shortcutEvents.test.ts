import { expect, it } from 'vitest';
import { DEFAULT_ENHANCE_SHORTCUT, toSessionEvent } from './shortcutEvents';

it('uses a visible development shortcut for optimized transcription', () => {
  expect(DEFAULT_ENHANCE_SHORTCUT).toBe('Right Alt');
});

it('turns the second shortcut press into a recording stop event', () => {
  expect(toSessionEvent({ action: 'rawWrite', phase: 'pressed' }, true)).toEqual({
    type: 'recording_stopped',
    audioId: 'pending-audio',
  });
});

it('ignores key release because the shortcut is press-to-toggle', () => {
  expect(toSessionEvent({ action: 'rawWrite', phase: 'released' }, true)).toBeNull();
});

it('keeps the target window captured at shortcut time', () => {
  expect(toSessionEvent({ action: 'rawWrite', phase: 'pressed', targetWindowId: 'window-1' }, false)).toEqual({
    type: 'shortcut',
    action: 'rawWrite',
    durationMs: 0,
    targetWindowId: 'window-1',
  });
});
