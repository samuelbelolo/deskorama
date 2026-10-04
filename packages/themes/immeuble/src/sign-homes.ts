import type { Rect } from '@deskorama/core';
import { SCALE } from './grid.ts';
import type { Layout } from './layout.ts';
import { signFrames } from './sign-frames.ts';
import { snapToTiles } from './snap-to-tiles.ts';
import { toStage } from './to-stage.ts';

/** Where each permanent sign lives, in screen pixels: no Gag and no plaque may land there. */
export interface SignHomes {
  /** The board of the crowd and today's count. */
  readonly board: Rect;
  /** The sign of the running total. */
  readonly poster: Rect;
  /** The hall's tally of intruders kept out today; null next door, which has no hall. */
  readonly hall: Rect | null;
}

/**
 * Returns the homes of the permanent signs, on whole tiles: the ground floor's three in the building; next door, the
 * LED panel and the painted wall.
 * @example
 * signHomes(layoutFor(FAKE_SCREEN)).poster; // { x: 720, y: 660, w: 180, h: 120 }
 */
export function signHomes(layout: Layout): SignHomes {
  if (layout.side === 'next') {
    const frames = signFrames(layout);

    return { board: snapToTiles(toStage(frames.board)), poster: snapToTiles(toStage(frames.poster)), hall: null };
  }

  const y = layout.rdcY * SCALE;

  return {
    board: { x: 0, y, w: 240, h: 120 },
    poster: { x: 720, y, w: 180, h: 120 },
    hall: { x: 420, y, w: 120, h: 120 },
  };
}
