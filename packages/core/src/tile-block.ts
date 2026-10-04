import type { Rect } from './rect.ts';

/** The side of one tile of the visible-region grid, in CSS pixels. */
export const TILE_SIZE = 60;

/** A screen's grid: how many tiles across and down. The last column or row may hang past the screen's edge. */
export interface Grid {
  readonly cols: number;
  readonly rows: number;
}

/** A block of whole tiles: its first column and row, and how many of each. Empty when either count is 0. */
export interface TileBlock {
  readonly col: number;
  readonly row: number;
  readonly cols: number;
  readonly rows: number;
}

/**
 * Returns the block of tiles a rectangle touches, clipped to the grid. A rectangle that only grazes a tile still
 * touches it; a rectangle outside the grid, or with no area, gives an empty block.
 * @example
 * tilesUnder({ x: 0, y: 0, w: 120, h: 60 }, { cols: 24, rows: 15 }); // { col: 0, row: 0, cols: 2, rows: 1 }
 * tilesUnder({ x: 0, y: 0, w: 121, h: 60 }, { cols: 24, rows: 15 }).cols; // 3
 * tilesUnder({ x: -500, y: 0, w: 100, h: 60 }, { cols: 24, rows: 15 }).cols; // 0
 */
export function tilesUnder(rect: Rect, grid: Grid): TileBlock {
  if (rect.w <= 0 || rect.h <= 0) return { col: 0, row: 0, cols: 0, rows: 0 };
  const col = Math.max(0, Math.floor(rect.x / TILE_SIZE));
  const row = Math.max(0, Math.floor(rect.y / TILE_SIZE));
  const lastCol = Math.min(grid.cols - 1, Math.ceil((rect.x + rect.w) / TILE_SIZE) - 1);
  const lastRow = Math.min(grid.rows - 1, Math.ceil((rect.y + rect.h) / TILE_SIZE) - 1);
  return { col, row, cols: Math.max(0, lastCol - col + 1), rows: Math.max(0, lastRow - row + 1) };
}
