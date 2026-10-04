import { describe, expect, test } from 'vitest';
import { createVisibleMap, type VisibleMap } from '../src/create-visible-map.ts';
import { createRandom } from '../src/random.ts';
import type { Rect } from '../src/rect.ts';
import type { Screen } from '../src/screen.ts';
import { BUILTIN, createManualHost, type ManualHost } from './manual-host.ts';

const EXTERNAL: Screen = { id: 'external', x: 0, y: 0, width: 1600, height: 900 };

/**
 * Returns a visible map of `screen` covered by `frames`, with the manual host whose Clock it reads.
 * @example
 * const { map } = covered([{ x: 0, y: 0, w: 720, h: 900 }]);
 * map.visibleFraction(); // 0.5
 */
function covered(
  frames: readonly Rect[],
  screen: Screen = BUILTIN,
  seed = 1,
): { map: VisibleMap; platform: ManualHost } {
  const platform = createManualHost();
  const map = createVisibleMap(screen, platform.clock, createRandom(seed));
  map.update(frames);
  return { map, platform };
}

/**
 * Returns true when two rectangles share some area.
 * @example
 * intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }); // true
 */
function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe('the visible map of a screen', () => {
  test('sees the whole screen until a window covers it', () => {
    const { map } = covered([]);
    expect(map.visibleFraction()).toBe(1);
    expect(map.isHidden()).toBe(false);
    expect(map.largestFree()).toEqual({ x: 0, y: 0, w: 1440, h: 900 });
  });

  test('counts a tile as covered as soon as a window touches it', () => {
    expect(covered([{ x: 0, y: 0, w: 720, h: 900 }]).map.visibleFraction()).toBe(0.5);
    expect(covered([{ x: 0, y: 0, w: 721, h: 900 }]).map.visibleFraction()).toBe(11 / 24);
    expect(covered([{ x: 0, y: 0, w: 720, h: 900 }]).map.visibleFraction({ x: 600, y: 0, w: 240, h: 60 })).toBe(0.5);
  });

  test('ignores windows on another screen, left or right of this one', () => {
    const { map } = covered([
      { x: -1440, y: 0, w: 1440, h: 900 },
      { x: 1440, y: 0, w: 1600, h: 900 },
    ]);
    expect(map.visibleFraction()).toBe(1);
  });

  test('is hidden when every tile is covered, the menu bar included', () => {
    const { map } = covered([
      { x: 0, y: 0, w: 1440, h: 25 },
      { x: 0, y: 25, w: 1440, h: 875 },
    ]);
    expect(map.visibleFraction()).toBe(0);
    expect(map.isHidden()).toBe(true);
    expect(map.largestFree()).toBeNull();
    expect(map.freeSpot({ w: 60, h: 60 })).toBeNull();
  });

  test('finds the largest fully visible rectangle', () => {
    const { map } = covered([
      { x: 0, y: 0, w: 720, h: 900 },
      { x: 720, y: 0, w: 720, h: 480 },
    ]);
    expect(map.largestFree()).toEqual({ x: 720, y: 480, w: 720, h: 420 });
  });

  test('cuts the largest rectangle at the edge of a screen whose width is not a whole number of tiles', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1500, h: 900 }], EXTERNAL);
    expect(map.largestFree()).toEqual({ x: 1500, y: 0, w: 100, h: 900 });
  });
});

describe('free spots', () => {
  test('are fully visible and of the requested size', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1000, h: 900 }]);
    const spot = map.freeSpot({ w: 200, h: 120 });
    expect(spot).toMatchObject({ w: 200, h: 120 });
    expect(spot === null ? 0 : map.visibleFraction(spot)).toBe(1);
  });

  test('never reach past the edge of the screen', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1500, h: 900 }], EXTERNAL);
    expect(map.freeSpot({ w: 100, h: 60 })).toBeNull();
    expect(map.freeSpot({ w: 80, h: 60 })).toMatchObject({ x: 1520, w: 80 });
  });

  test('come closest to the point asked for, inside the region asked for', () => {
    const { map } = covered([]);
    expect(map.freeSpot({ w: 120, h: 120, near: { x: 1380, y: 840 } })).toMatchObject({ x: 1320, y: 780 });
    const band = { x: 0, y: 600, w: 1440, h: 300 };
    const spot = map.freeSpot({ w: 120, h: 120, near: { x: 0, y: 0 }, within: band });
    expect(spot).toMatchObject({ x: 0, y: 600 });
  });

  test('stay off the rectangles to avoid', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1440, h: 780 }]);
    const avoid = [{ x: 0, y: 780, w: 700, h: 120 }];
    const spot = map.freeSpot({ w: 120, h: 120, near: { x: 0, y: 840 }, avoid });
    expect(spot).toMatchObject({ x: 720, y: 780 });
  });

  test('are drawn with the seeded random generator: the same seed gives the same spot', () => {
    const first = covered([], BUILTIN, 42).map.freeSpot({ w: 200, h: 120 });
    const again = covered([], BUILTIN, 42).map.freeSpot({ w: 200, h: 120 });
    expect(again).toMatchObject({ x: first?.x, y: first?.y });
    const other = covered([], BUILTIN, 43).map.freeSpot({ w: 200, h: 120 });
    expect([other?.x, other?.y]).not.toEqual([first?.x, first?.y]);
  });
});

describe('held spots and reservations', () => {
  test('two held spots never overlap, until the hold runs out on the Clock', () => {
    const { map, platform } = covered([{ x: 0, y: 0, w: 1440, h: 660 }]);
    const request = { w: 1440, h: 120, hold: 4000, near: { x: 0, y: 0 } };
    const first = map.freeSpot(request);
    const second = map.freeSpot(request);
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first !== null && second !== null && intersects(first, second)).toBe(false);
    expect(map.freeSpot(request)).toBeNull();
    platform.advance(4000);
    expect(map.freeSpot(request)).not.toBeNull();
  });

  test('a held spot given back early is free again', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1440, h: 780 }]);
    const held = map.freeSpot({ w: 1440, h: 120, hold: 60_000 });
    expect(map.freeSpot({ w: 60, h: 60 })).toBeNull();
    held?.release();
    expect(map.freeSpot({ w: 60, h: 60 })).not.toBeNull();
  });

  test('a reserved sign keeps every spot off it until released, and counts as taken when asked', () => {
    const { map } = covered([{ x: 0, y: 0, w: 1440, h: 780 }]);
    const release = map.reserve({ x: 0, y: 780, w: 700, h: 120 });
    const spot = map.freeSpot({ w: 120, h: 120, near: { x: 0, y: 840 } });
    expect(spot).toMatchObject({ x: 720, y: 780 });
    expect(map.largestFree()).toEqual({ x: 0, y: 780, w: 1440, h: 120 });
    expect(map.largestFree({ skipHeld: true })).toEqual({ x: 720, y: 780, w: 720, h: 120 });
    release();
    expect(map.freeSpot({ w: 120, h: 120, near: { x: 0, y: 840 } })).toMatchObject({ x: 0, y: 780 });
  });
});
