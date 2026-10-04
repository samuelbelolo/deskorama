import type { Point } from './rect.ts';
import { TILE_SIZE, type TileBlock } from './tile-block.ts';

/**
 * Returns the block whose centre is closest to a point; the first one on a tie.
 * @example
 * closestBlock([{ col: 0, row: 0, cols: 2, rows: 2 }, { col: 20, row: 10, cols: 2, rows: 2 }], { x: 1300, y: 700 });
 * // { col: 20, row: 10, cols: 2, rows: 2 }
 */
export function closestBlock(candidates: readonly [TileBlock, ...TileBlock[]], point: Point): TileBlock {
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const block of candidates) {
    const dx = (block.col + block.cols / 2) * TILE_SIZE - point.x;
    const dy = (block.row + block.rows / 2) * TILE_SIZE - point.y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = block;
    }
  }
  return best;
}
