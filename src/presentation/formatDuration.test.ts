import { describe, expect, it } from 'vitest';
import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('shows short model calls in milliseconds', () => {
    expect(formatDuration(842)).toBe('842ms');
  });

  it('shows longer model calls in seconds with one decimal place', () => {
    expect(formatDuration(1842)).toBe('1.8s');
  });
});
