import type { Rect } from '@deskorama/core';
import { TILE } from './grid.ts';
import type { Room } from './room.ts';

/**
 * Returns one window bay of a room in screen pixels: one tile wide, the room's height.
 * @example
 * bayStage(room, 1); // the middle bay of a flat
 */
export function bayStage(room: Room, bay: number): Rect {
  return { x: (room.col + bay) * TILE, y: room.row * TILE, w: TILE, h: room.rows * TILE };
}
