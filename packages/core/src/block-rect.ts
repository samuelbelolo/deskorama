import type { Rect } from './rect.ts';
import { TILE_SIZE, type TileBlock } from './tile-block.ts';

/**
 * Returns the pixels of a block of tiles, cut at the screen's edge so a partial last column or row never reaches
 * past it.
 * @example
 * blockRect({ col: 25, row: 0, cols: 2, rows: 1 }, { width: 1600, height: 900 }); // { x: 1500, y: 0, w: 100, h: 60 }
 */
export function blockRect(block: TileBlock, screen: { readonly width: number; readonly height: number }): Rect {
  const x = block.col * TILE_SIZE;
  const y = block.row * TILE_SIZE;
  return {
    x,
    y,
    w: Math.min(block.cols * TILE_SIZE, screen.width - x),
    h: Math.min(block.rows * TILE_SIZE, screen.height - y),
  };
}
