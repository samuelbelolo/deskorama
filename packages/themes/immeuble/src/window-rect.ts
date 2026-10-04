import type { Rect } from '@deskorama/core';
import type { Room } from './room.ts';

/**
 * Returns the glass of a flat's courtyard window, in its middle bay, in native pixels.
 * @example
 * windowRect(room); // { x: room.x + 18, y: room.y + 5, w: 9, h: 13 }
 */
export function windowRect(room: Room): Rect {
  const w = 9;

  return { x: room.x + Math.floor((room.w - w) / 2), y: room.y + 5, w, h: 13 };
}
