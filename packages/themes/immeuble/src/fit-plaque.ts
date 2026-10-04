import type { FreeSpot, Point, Rect } from '@deskorama/core';
import type { Placement } from './create-placement.ts';
import { SCALE } from './grid.ts';
import { layoutPlaque, type PlaqueLayout } from './layout-plaque.ts';
import type { PlaqueWords } from './plaque-words.ts';
import type { Plaque } from './plaque.ts';

/** The blocks a plaque may take, in screen pixels: wide and low first, the narrow tall columns last. */
const SIZES = [
  [600, 120],
  [480, 120],
  [420, 120],
  [360, 120],
  [300, 120],
  [240, 120],
  [180, 120],
  [360, 180],
  [240, 180],
  [180, 180],
  [120, 120],
  [120, 180],
  [120, 240],
  [480, 60],
  [420, 60],
  [360, 60],
  [300, 60],
  [240, 60],
] as const;

/** How far from its actor a plaque may hang, centre to centre, in screen pixels, unless told otherwise. */
const PLAQUE_REACH = 520;

/**
 * Fits a plaque's words in the best visible block near its actor and holds that block: close, rich and whole words
 * score best; with `whole`, only blocks that hold the detail too. Null when no block in reach can hold the fact.
 * @example
 * fitPlaque(place, words, { x: 135, y: 165, w: 45, h: 30 }, { hold: 7500, avoid: [stage] });
 */
export function fitPlaque(
  place: Placement,
  words: PlaqueWords,
  anchor: Rect,
  options: {
    readonly hold: number;
    readonly reach?: number;
    readonly avoid?: readonly Rect[];
    readonly whole?: boolean;
  },
): Plaque | null {
  const near: Point = { x: (anchor.x + anchor.w / 2) * SCALE, y: (anchor.y + anchor.h / 2) * SCALE };
  const reach = options.reach ?? PLAQUE_REACH;
  const avoid = options.avoid ?? [];
  let best: { score: number; spot: FreeSpot; lines: PlaqueLayout } | null = null;

  for (const [w, h] of SIZES) {
    const lines = layoutPlaque(words, w / SCALE, h / SCALE);
    if (lines === null || (options.whole === true && lines.shown.detail !== words.detail)) continue;

    const spot = place.anywhere({ w, h, near, avoid });
    if (spot === null) continue;

    const distance = Math.hypot(spot.x + w / 2 - near.x, spot.y + h / 2 - near.y);
    if (distance > reach) continue;

    const score = distance * 0.6 + lines.penalty + lines.rows.length * 4;
    if (best === null || score < best.score) best = { score, spot, lines };
  }

  if (best === null) return null;

  const { spot, lines } = best;
  const held = place.anywhere({
    w: spot.w,
    h: spot.h,
    near: { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 },
    hold: options.hold,
    avoid,
  });
  if (held === null) return null;

  return {
    box: { x: held.x / SCALE, y: held.y / SCALE, w: held.w / SCALE, h: held.h / SCALE },
    rows: lines.rows,
    anchor,
    shown: lines.shown,
    spot: held,
  };
}
