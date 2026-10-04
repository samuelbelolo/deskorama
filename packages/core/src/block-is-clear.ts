import type { Grid, TileBlock } from './tile-block.ts';

/**
 * Returns true when no tile of `block` is set in the grid mask.
 * @example
 * blockIsClear(new Uint8Array(24 * 15), { cols: 24, rows: 15 }, { col: 3, row: 4, cols: 2, rows: 2 }); // true
 */
export function blockIsClear(mask: Uint8Array, grid: Grid, block: TileBlock): boolean {
  for (let row = block.row; row < block.row + block.rows; row += 1) {
    for (let col = block.col; col < block.col + block.cols; col += 1) {
      if (mask[row * grid.cols + col] !== 0) return false;
    }
  }
  return true;
}
