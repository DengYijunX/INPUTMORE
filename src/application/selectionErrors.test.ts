import { describe, expect, it } from 'vitest';
import { describeSelectionError } from './selectionErrors';

describe('selection errors', () => {
  it('keeps the underlying boundary error visible to the user', () => {
    expect(describeSelectionError(new Error('无法恢复目标窗口'))).toBe('读取选中文字失败：无法恢复目标窗口');
    expect(describeSelectionError('复制失败')).toBe('读取选中文字失败：复制失败');
  });
});
