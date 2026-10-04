import type { FreeSpot, Point, Rect, WallpaperEvent } from '@deskorama/core';
import type { Band } from './create-placement.ts';
import type { GagEnv } from './gag.ts';
import { rowY } from './row-y.ts';
import type { Plaque } from './plaque.ts';
import { say } from './say.ts';
import { gagSpan } from './timing.ts';
import { toNative } from './to-native.ts';

/** Where a Gag looks for a stage, in order: the ground floor first, then the sidewalk, the facade, anywhere. */
const BANDS: readonly (Band | null)[] = ['rdc', 'sidewalk', 'facade', null];

/** How many stages a band offers before the next band is tried, each given back when its plaque does not fit. */
const TRIES_PER_BAND = 4;

/** A stage size in screen pixels. */
export type StageSize = readonly [w: number, h: number];

/** A Gag's held stage, its native box, and its held plaque. */
export interface Staged {
  readonly spot: FreeSpot;
  readonly box: Rect;
  readonly plaque: Plaque;
}

/**
 * Finds and holds a stage and its plaque together: the first size of `sizes` that has a visible block whose plaque
 * fits beside it. A block whose plaque does not fit is given back at once, so a Gag never holds a room it cannot
 * explain. Commons take 120 x 120, notables 180 x 120; a wide picture asks for 240 first.
 * @example
 * stageFor(env, event, { duration: 2600, sizes: [[180, 120]] }); // { spot: { x: 540, y: 660, ... }, box, plaque }
 */
export function stageFor(
  env: GagEnv,
  event: WallpaperEvent,
  ask: {
    readonly duration: number;
    readonly sizes: readonly StageSize[];
    readonly sound?: string | null;
    readonly near?: Point;
  },
): Staged | null {
  const hold = gagSpan(ask.duration);
  const near = ask.near ?? { x: env.layout.width / 3, y: rowY(env.layout, 12) };

  for (const [w, h] of ask.sizes) {
    const avoid: Rect[] = [];

    for (const band of BANDS) {
      for (let i = 0; i < TRIES_PER_BAND; i += 1) {
        const request = { w, h, near, hold, avoid };
        const spot = band === null ? env.place.anywhere(request) : env.place.inBand(band, request);
        if (spot === null) break;

        const box = toNative(spot);
        const said = ask.sound === undefined ? { avoid: [spot] } : { avoid: [spot], sound: ask.sound };
        const plaque = say(env, event, box, ask.duration, said);
        if (plaque !== null) return { spot, box, plaque };

        spot.release();
        avoid.push(spot);
      }
    }
  }

  return null;
}
