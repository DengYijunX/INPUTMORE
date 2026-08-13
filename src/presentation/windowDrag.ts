export async function startDragFromPointer(
  event: { button: number; target?: EventTarget | { closest?: (selector: string) => unknown } },
  startDragging: () => Promise<void>,
): Promise<void> {
  if (event.button !== 0) return;
  const target = event.target as { closest?: (selector: string) => unknown } | undefined;
  if (target?.closest?.('button, input, select, textarea, a')) return;
  await startDragging();
}
