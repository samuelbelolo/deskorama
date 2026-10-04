import { blockIsClear } from './block-is-clear.ts';
import { blocksOverlap } from './blocks-overlap.ts';
import { closestBlock } from './closest-block.ts';
import type { Random } from './random.ts';
import type { Rect } from './rect.ts';
import type { SpotRequest } from './spot-request.ts';
import { TILE_SIZE, tilesUnder, type Grid, type TileBlock } from './tile-block.ts';

/** What a spot search looks at: the grid, the screen's size, the taken tiles and the random generator. */
export interface SpotSearch {
  readonly grid: Grid;
  readonly width: number;
  readonly height: number;
  /** One byte per tile, row by row: 1 when a window covers it or a Gag or a sign holds it. */
  readonly taken: Uint8Array;
  readonly random: Random;
}

/**
 * Returns a spot of the requested size on clear tiles, centred in its block of tiles and inside the screen, with
 * that block; null when no block is clear. Without `near`, the spot is drawn with the seeded random generator.
 * @example
 * findFreeSpot(search, { w: 200, h: 120, near: { x: 1200, y: 700 } }); // { block, rect: { x: 1150, y: 660, ... } }
 */
export function findFreeSpot(search: SpotSearch, request: SpotRequest): { block: TileBlock; rect: Rect } | null {
  const { grid } = search;
  const span = {
    cols: Math.max(1, Math.ceil(request.w / TILE_SIZE)),
    rows: Math.max(1, Math.ceil(request.h / TILE_SIZE)),
  };
  const area = request.within === undefined ? { col: 0, row: 0, ...grid } : tilesUnder(request.within, grid);
  const avoid = (request.avoid ?? []).map((rect) => tilesUnder(rect, grid));
  const candidates: TileBlock[] = [];
  for (let row = area.row; row + span.rows <= area.row + area.rows; row += 1) {
    for (let col = area.col; col + span.cols <= area.col + area.cols; col += 1) {
      const block = { col, row, ...span };
      const rect = spotIn(block, request);
      const inside = rect.x + rect.w <= search.width && rect.y + rect.h <= search.height;
      if (inside && blockIsClear(search.taken, grid, block) && !avoid.some((other) => blocksOverlap(other, block))) {
        candidates.push(block);
      }
    }
  }
  const [first, ...others] = candidates;
  if (first === undefined) return null;
  const block =
    request.near === undefined
      ? (candidates[Math.floor(search.random.next() * candidates.length)] ?? first)
      : closestBlock([first, ...others], request.near);
  return { block, rect: spotIn(block, request) };
}

/**
 * Returns the requested size centred in a block of tiles.
 * @example
 * spotIn({ col: 2, row: 1, cols: 4, rows: 2 }, { w: 200, h: 120 }); // { x: 140, y: 60, w: 200, h: 120 }
 */
function spotIn(block: TileBlock, request: SpotRequest): Rect {
  return {
    x: block.col * TILE_SIZE + (block.cols * TILE_SIZE - request.w) / 2,
    y: block.row * TILE_SIZE + (block.rows * TILE_SIZE - request.h) / 2,
    w: request.w,
    h: request.h,
  };
}
