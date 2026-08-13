import { describe, expect, it } from 'vitest';
import { WRITEBACK_FAILURE_COPY, COPY_TEXT_LABEL } from './errorCopy';

describe('write-back error copy', () => {
  it('uses the concise recovery wording', () => {
    expect(WRITEBACK_FAILURE_COPY).toBe('写入失败，复制文本');
    expect(COPY_TEXT_LABEL).toBe('复制文本');
  });
});
