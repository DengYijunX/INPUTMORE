export const DEFAULT_ENHANCE_SHORTCUT = 'Ctrl+Shift+Space';

export type ShortcutEvent = {
  action: 'enhance' | 'translate' | 'ask';
  phase: 'pressed' | 'released';
};
