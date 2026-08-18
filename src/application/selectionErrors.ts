export function describeSelectionError(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `读取选中文字失败：${detail}`;
}
