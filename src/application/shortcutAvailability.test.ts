import { describe, expect, it } from 'vitest';
import { canStartShortcut } from './shortcutAvailability';

describe('shortcut availability', () => {
  it('allows retrying selected-text processing after its own error', () => {
    expect(canStartShortcut({ tag: 'error', action: 'enhance', message: '未检测到选中文字', retryable: false }, 'enhance')).toBe(true);
    expect(canStartShortcut({ tag: 'error', action: 'rawWrite', message: '麦克风不可用', retryable: true }, 'enhance')).toBe(false);
    expect(canStartShortcut({ tag: 'error', action: 'enhance', message: '未检测到选中文字', retryable: false }, 'rawWrite')).toBe(false);
  });
});
