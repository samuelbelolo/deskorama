import type { Point } from '@deskorama/core';

/**
 * Lets an element be dragged by a handle. Pointer moves are in page pixels; `scale` converts them to the fake
 * screen's pixels, since the screen is drawn scaled down. `move` gets the wanted position and returns the one kept.
 * Returns what stops listening.
 * @example
 * makeDraggable(bar, () => ({ x: spec.x, y: spec.y }), () => screenScale(), (wanted) => moveWindow(id, wanted));
 */
export function makeDraggable(
  handle: HTMLElement,
  position: () => Point,
  scale: () => number,
  move: (wanted: Point) => void,
): () => void {
  const down = (start: PointerEvent): void => {
    handle.setPointerCapture(start.pointerId);
    const from = position();
    const ratio = scale();
    const drag = (event: PointerEvent): void =>
      move({
        x: from.x + (event.clientX - start.clientX) / ratio,
        y: from.y + (event.clientY - start.clientY) / ratio,
      });
    const up = (): void => {
      handle.removeEventListener('pointermove', drag);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', drag);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  handle.addEventListener('pointerdown', down);
  return () => handle.removeEventListener('pointerdown', down);
}
