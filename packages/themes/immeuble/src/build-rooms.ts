import { BAY, BUILDING_BAYS } from './grid.ts';
import type { Layout } from './layout.ts';
import type { Room } from './room.ts';
import { toStage } from './to-stage.ts';

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

/**
 * Returns one three-bay room at a tile column and row.
 * @example
 * makeRoom('f1-0', 0, 9, 2).floorY; // 162
 */
function makeRoom(id: string, col: number, row: number, rows: number): Room {
  const x = col * BAY;
  const y = row * BAY;
  const w = 3 * BAY;
  const h = rows * BAY;

  return {
    id,
    col,
    row,
    rows,
    bays: 3,
    x,
    y,
    w,
    h,
    floorY: y + h - 3,
    seed: (col * 7 + row * 13) % 11,
    stage: toStage({ x, y, w, h }),
  };
}
