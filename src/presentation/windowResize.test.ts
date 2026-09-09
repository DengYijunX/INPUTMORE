import { describe, expect, it } from 'vitest';
import { getFloatingWindowHeight } from './windowResize';

describe('getFloatingWindowHeight', () => {
  it('keeps the minimum height for the idle capsule', () => {
    expect(getFloatingWindowHeight(46, 66)).toBe(90);
  });

  it('uses document height when expanded content exceeds the card measurement', () => {
    expect(getFloatingWindowHeight(215, 280)).toBe(280);
  });

  it('adds the window padding when the card is the larger measurement', () => {
    expect(getFloatingWindowHeight(260, 200)).toBe(280);
  });
});
