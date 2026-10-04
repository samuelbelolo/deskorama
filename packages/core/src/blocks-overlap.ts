import type { TileBlock } from './tile-block.ts';

/**
 * Returns true when two blocks of tiles share at least one tile; an empty block overlaps nothing.
 * @example
 * blocksOverlap({ col: 0, row: 0, cols: 2, rows: 2 }, { col: 1, row: 1, cols: 2, rows: 2 }); // true
 * blocksOverlap({ col: 0, row: 0, cols: 2, rows: 2 }, { col: 2, row: 0, cols: 2, rows: 2 }); // false
 */
export function blocksOverlap(a: TileBlock, b: TileBlock): boolean {
  if (a.cols === 0 || a.rows === 0 || b.cols === 0 || b.rows === 0) return false;
  return a.col < b.col + b.cols && b.col < a.col + a.cols && a.row < b.row + b.rows && b.row < a.row + a.rows;
}
