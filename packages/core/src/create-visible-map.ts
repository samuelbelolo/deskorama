import { blockRect } from './block-rect.ts';
import type { Clock } from './clock.ts';
import { createHolds } from './create-holds.ts';
import { findFreeSpot } from './find-free-spot.ts';
import { largestClearBlock } from './largest-clear-block.ts';
import { markBlock } from './mark-block.ts';
import type { Random } from './random.ts';
import type { Rect } from './rect.ts';
import type { Screen } from './screen.ts';
import { TILE_SIZE, tilesUnder } from './tile-block.ts';
import type { VisibleRegions } from './visible-regions.ts';

/** The visible regions of one screen, recomputed whenever the window frames change. */
export interface VisibleMap extends VisibleRegions {
  /** Recomputes the grid from everything covering the wallpaper, in desktop coordinates. */
  readonly update: (frames: readonly Rect[]) => void;
}

/**
 * Returns the visible map of one screen: a grid of 60 px tiles, all visible until `update` receives window frames.
 * It is pure apart from the injected Clock (when holds expire) and the seeded random generator (which free spot),
 * so the engine and a renderer that runs the Theme on its own can both build one.
 * @example
 * const map = createVisibleMap({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }, clock, createRandom(1));
 * map.update([{ x: 0, y: 0, w: 720, h: 900 }]);
 * map.visibleFraction(); // 0.5
 * map.freeSpot({ w: 200, h: 120, hold: 4000 }); // a spot on the right half, held for 4 s
 */
export function createVisibleMap(screen: Screen, clock: Clock, random: Random): VisibleMap {
  const grid = { cols: Math.ceil(screen.width / TILE_SIZE), rows: Math.ceil(screen.height / TILE_SIZE) };
  const holds = createHolds(clock);
  let covered = new Uint8Array(grid.cols * grid.rows);
  let hidden = false;
  const taken = (): Uint8Array => {
    const mask = covered.slice();
    holds.markInto(mask, grid);
    return mask;
  };
  const visibleFraction = (rect: Rect = { x: 0, y: 0, w: screen.width, h: screen.height }): number => {
    const block = tilesUnder(rect, grid);
    let visible = 0;
    for (let row = block.row; row < block.row + block.rows; row += 1) {
      for (let col = block.col; col < block.col + block.cols; col += 1)
        if (covered[row * grid.cols + col] === 0) visible += 1;
    }
    return block.cols * block.rows === 0 ? 0 : visible / (block.cols * block.rows);
  };
  return {
    update(frames) {
      covered = new Uint8Array(grid.cols * grid.rows);
      for (const frame of frames) {
        markBlock(covered, grid, tilesUnder({ ...frame, x: frame.x - screen.x, y: frame.y - screen.y }, grid));
      }
      hidden = !covered.includes(0);
    },
    visibleFraction,
    largestFree(options = {}) {
      const block = largestClearBlock(options.skipHeld === true ? taken() : covered, grid);
      return block === null ? null : blockRect(block, screen);
    },
    freeSpot(request) {
      const found = findFreeSpot({ grid, width: screen.width, height: screen.height, taken: taken(), random }, request);
      if (found === null) return null;
      const hold = request.hold ?? 0;
      const release = hold > 0 ? holds.add(found.block, clock.now() + hold) : () => {};
      return { ...found.rect, release };
    },
    reserve(rect) {
      return holds.add(tilesUnder(rect, grid), Infinity);
    },
    isHidden: () => hidden,
  };
}
