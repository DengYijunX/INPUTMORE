import { expect, it } from 'vitest';
import { DEFAULT_ENHANCE_SHORTCUT } from './shortcutEvents';

it('uses a visible development shortcut for optimized transcription', () => {
  expect(DEFAULT_ENHANCE_SHORTCUT).toBe('Ctrl+Shift+Space');
});
