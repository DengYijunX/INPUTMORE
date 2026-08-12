import { expect, it, vi } from 'vitest';
import { startDragFromPointer } from './windowDrag';

it('starts dragging only for a primary-button pointer press', async () => {
  const startDragging = vi.fn().mockResolvedValue(undefined);

  await startDragFromPointer({ button: 0 }, startDragging);
  expect(startDragging).toHaveBeenCalledOnce();

  await startDragFromPointer({ button: 2 }, startDragging);
  expect(startDragging).toHaveBeenCalledOnce();
});
