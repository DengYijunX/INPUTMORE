export async function startDragFromPointer(
  event: { button: number },
  startDragging: () => Promise<void>,
): Promise<void> {
  if (event.button !== 0) return;
  await startDragging();
}
