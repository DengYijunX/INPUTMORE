export const DEFAULT_ENHANCE_SHORTCUT = 'Right Alt';

export type ShortcutEvent = {
  action: 'enhance' | 'translate' | 'ask';
  phase: 'pressed' | 'released';
  targetWindowId?: string;
};

export function toSessionEvent(event: ShortcutEvent, recording: boolean) {
  if (event.phase !== 'pressed') {
    return null;
  }
  if (recording) {
    return { type: 'recording_stopped' as const, audioId: 'pending-audio' };
  }
  return { type: 'shortcut' as const, action: event.action, durationMs: 0, ...(event.targetWindowId ? { targetWindowId: event.targetWindowId } : {}) };
}
