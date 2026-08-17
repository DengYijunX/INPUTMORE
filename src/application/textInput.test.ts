import { describe, expect, it } from 'vitest';
import { shouldSubmitTextInput } from './textInput';

describe('text input submission', () => {
  it('submits only when Enter is combined with Ctrl or Meta', () => {
    expect(shouldSubmitTextInput({ key: 'Enter', ctrlKey: true, metaKey: false })).toBe(true);
    expect(shouldSubmitTextInput({ key: 'Enter', ctrlKey: false, metaKey: true })).toBe(true);
    expect(shouldSubmitTextInput({ key: 'Enter', ctrlKey: false, metaKey: false })).toBe(false);
    expect(shouldSubmitTextInput({ key: 'Escape', ctrlKey: true, metaKey: false })).toBe(false);
  });
});
