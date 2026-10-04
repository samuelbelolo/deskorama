import { BAY } from './grid.ts';
import type { Room } from './room.ts';
import { toStage } from './to-stage.ts';

/**
 * Returns one room of `bays` bays at a tile column and row, `rows` tile rows high: 2 for a flat, 1 for a mansard
 * room.
 * @example
 * makeRoom('f1-0', 0, 9, 2).floorY; // 162
 * makeRoom('n1-5', 5, 9, 2, 5).stage; // { x: 300, y: 540, w: 300, h: 120 }
 */
export function makeRoom(id: string, col: number, row: number, rows: number, bays = 3): Room {
  const x = col * BAY;
  const y = row * BAY;
  const w = bays * BAY;
  const h = rows * BAY;

  return {
    id,
    col,
    row,
    rows,
    bays,
    x,
    y,
    w,
    h,
    floorY: y + h - 3,
    seed: (col * 7 + row * 13 + (bays - 3) * 5) % 11,
    stage: toStage({ x, y, w, h }),
  };
}
