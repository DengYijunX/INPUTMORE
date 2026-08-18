import { describe, expect, it } from 'vitest';
import { createTimingRecord } from './timing';

describe('createTimingRecord', () => {
  it('rounds end-to-end timing while preserving stage names', () => {
    expect(createTimingRecord({
      flow: 'selected-text',
      totalMs: 1842.6,
      captureMs: 126.4,
      modelMs: 1716.2,
    })).toEqual({
      flow: 'selected-text',
      totalMs: 1843,
      captureMs: 126,
      modelMs: 1716,
    });
  });
});
