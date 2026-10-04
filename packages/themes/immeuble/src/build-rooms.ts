import { BUILDING_BAYS } from './grid.ts';
import type { Layout } from './layout.ts';
import { makeRoom } from './make-room.ts';
import type { Room } from './room.ts';

/** The first column of each three-bay flat; the stairwell owns columns 6 to 8. */
const FLAT_COLS = [0, 3, 9, 12, 15, 18, 21] as const;

/** The block rows of the three floors, first floor first. */
const FLOOR_ROWS = [9, 7, 5] as const;

/** The block row of the mansard. */
const ATTIC_ROW = 4;

/**
 * Returns the 29 rooms of the building: three floors of seven flats, then eight mansard rooms under the zinc.
 * @example
 * buildRooms(layoutFor(FAKE_SCREEN)).length; // 29
 * buildRooms(layoutFor(FAKE_SCREEN))[0].stage; // { x: 0, y: 540, w: 180, h: 120 }
 */
export function buildRooms(layout: Layout): Room[] {
  const rooms: Room[] = [];

  FLOOR_ROWS.forEach((row, index) => {
    for (const col of FLAT_COLS) rooms.push(makeRoom(`f${index + 1}-${col}`, col, layout.topRow + row, 2));
  });
  for (let col = 0; col < BUILDING_BAYS; col += 3)
    rooms.push(makeRoom(`attic-${col}`, col, layout.topRow + ATTIC_ROW, 1));

  return rooms;
}
