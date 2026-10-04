import type { Grid, TileBlock } from './tile-block.ts';

/**
 * Sets every tile of `block` to 1 in a grid mask (one byte per tile, row by row), ignoring tiles past the grid.
 * @example
 * const mask = new Uint8Array(24 * 15);
 * markBlock(mask, { cols: 24, rows: 15 }, { col: 0, row: 0, cols: 2, rows: 1 }); // mask[0] and mask[1] are 1
 */
export function markBlock(mask: Uint8Array, grid: Grid, block: TileBlock): void {
  const lastRow = Math.min(grid.rows, block.row + block.rows);
  const lastCol = Math.min(grid.cols, block.col + block.cols);
  for (let row = block.row; row < lastRow; row += 1) {
    mask.fill(1, row * grid.cols + block.col, row * grid.cols + lastCol);
  }
}
