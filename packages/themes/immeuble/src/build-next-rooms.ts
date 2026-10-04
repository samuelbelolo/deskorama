import type { Layout } from './layout.ts';
import { makeRoom } from './make-room.ts';
import type { Room } from './room.ts';

/** The first column of each five-bay flat of the next building. */
const FLAT_COLS = [0, 5, 10] as const;

/** The block rows of its three floors, first floor first, and of its mansard. */
const FLOOR_ROWS = [9, 7, 5] as const;
const ATTIC_ROW = 4;

/**
 * Returns the 12 rooms of the next building along the street: three floors of three wide flats, then three mansard
 * rooms under its zinc.
 * @example
 * buildNextRooms(layoutFor(EXTERNAL)).length; // 12
 * buildNextRooms(layoutFor(EXTERNAL))[0].stage; // { x: 0, y: 540, w: 300, h: 120 }
 */
export function buildNextRooms(layout: Layout): Room[] {
  const rooms: Room[] = [];

  FLOOR_ROWS.forEach((row, index) => {
    for (const col of FLAT_COLS) rooms.push(makeRoom(`n${index + 1}-${col}`, col, layout.topRow + row, 2, 5));
  });
  for (const col of FLAT_COLS) rooms.push(makeRoom(`n-attic-${col}`, col, layout.topRow + ATTIC_ROW, 1, 5));

  return rooms;
}
