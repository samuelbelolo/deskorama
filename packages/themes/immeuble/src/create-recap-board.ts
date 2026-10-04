import type { Cancel, FreeSpot, Rect, Recap } from '@deskorama/core';
import type { Mirror } from './create-mirror.ts';
import { drawRecapBoard, recapRows } from './draw-recap-board.ts';
import type { GagEnv } from './gag.ts';
import { recapCells, type RecapLayout } from './recap-cells.ts';
import { toNative } from './to-native.ts';

/** How long the board shows: under the eight seconds the engine waits before replaying a missed failed deploy. */
export const RECAP_SHOW_MS = 7600;

/** The board's sizes in screen pixels, the biggest first. */
const SIZES = [
  [600, 180],
  [720, 120],
  [480, 180],
  [480, 120],
  [420, 120],
] as const;

/** How the counts climb: when the first cell starts, how much later each next one does, and how fast they count. */
const COUNT_FROM = 300;
const CELL_LAG = 120;
const STEP_MS = 90;

/** Does nothing: what an absent wait or mirror stops. */
const noop = (): void => {};

/** The recap board of one screen. */
export interface RecapBoard {
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(now: number): boolean;
  dispose(): void;
}

/** A board on screen: its held box, its cells, when it went up, and the words last mirrored. */
interface Shown {
  readonly spot: FreeSpot;
  readonly layout: RecapLayout;
  readonly rows: number;
  readonly start: number;
  said: string;
}

/**
 * Listens for the recap of what was missed while the wallpaper was hidden and shows it as an end-of-level tally in
 * the biggest visible block that holds it: the title with the total climbing as the cells count up (under reduced
 * motion, the final counts at once), one cell per Role, rarest first, and "N AUTRES" for the rest. Every frame adds
 * up. When no block is free, it waits for a window to move until its time is up. Its words are mirrored.
 * @example
 * const board = createRecapBoard(env, mirror);
 */
export function createRecapBoard(env: GagEnv, mirror: Mirror): RecapBoard {
  const { host } = env;
  let shown: Shown | null = null;
  let waiting: Cancel = noop;
  let ending: Cancel = noop;
  let unmirror: Cancel = noop;

  const takeDown = (): void => {
    shown?.spot.release();
    unmirror();
    shown = null;
  };

  const show = (recap: Recap, until: number): boolean => {
    const left = until - host.clock.now();
    const spot = left > 1000 ? placeBoard(env, left) : null;
    if (spot === null) return false;

    takeDown();
    shown = boardIn(env, recap, spot);
    ending();
    ending = host.clock.after(left, takeDown);

    return true;
  };

  const stopRecaps = host.onRecap((recap) => {
    waiting();
    const until = host.clock.now() + RECAP_SHOW_MS;
    waiting = show(recap, until) ? noop : waitForRoom(env, () => show(recap, until));
  });

  return {
    draw(ctx, now) {
      if (shown === null) return;

      const t = host.reducedMotion ? Number.POSITIVE_INFINITY : now - shown.start;
      const counts = countsAt(shown.layout, t);
      const words = drawRecapBoard(ctx, env.copy, toNative(shown.spot), {
        layout: shown.layout,
        rows: shown.rows,
        counts,
      });

      const said = words.join('|');
      if (said === shown.said) return;
      shown.said = said;
      unmirror = mirrorBoard(mirror, shown.spot, words);
    },
    busy: () => shown !== null,
    dispose() {
      stopRecaps();
      waiting();
      ending();
      takeDown();
    },
  };
}

/**
 * Returns a board set up in its held block: its cells laid out for the block, and the Clock time it went up.
 * @example
 * boardIn(env, recap, spot).layout.cells.length; // 5
 */
function boardIn(env: GagEnv, recap: Recap, spot: FreeSpot): Shown {
  const box = toNative(spot);
  const rows = recapRows(box.h);
  const layout = recapCells(env.copy, recap, { rows, width: box.w - 8 });

  return { spot, layout, rows, start: env.host.clock.now(), said: '' };
}

/**
 * Mirrors what the board says over its block, the title first, then each cell; returns what removes it.
 * @example
 * mirrorBoard(mirror, spot, ['PENDANT TON ABSENCE 13', '1 GRAND MOMENT']);
 */
function mirrorBoard(mirror: Mirror, box: Rect, words: readonly string[]): Cancel {
  const parts = words.map((text, i) => [i === 0 ? 'recap-title' : 'recap-cell', text] as const);

  return mirror.set('recap', { box, data: { part: 'recap' }, parts });
}

/**
 * Holds the biggest block the board fits in, low on the screen first, for `hold` ms; null when none is free.
 * @example
 * placeBoard(env, 7600); // { x: 420, y: 600, w: 600, h: 180 } with no window
 */
function placeBoard(env: GagEnv, hold: number): FreeSpot | null {
  const near = { x: env.layout.width / 2, y: env.layout.height * 0.75 };

  for (const [w, h] of SIZES) {
    const spot = env.place.anywhere({ w, h, near, hold });
    if (spot !== null) return spot;
  }

  return null;
}

/**
 * Tries `show` again whenever a window moves, until it shows or the recap's time is up; returns what stops waiting.
 * @example
 * waiting = waitForRoom(env, () => show(recap, until));
 */
function waitForRoom(env: GagEnv, show: () => boolean): Cancel {
  const { host } = env;
  const stopListening = host.onVisibility(() => {
    if (show()) stopListening();
  });
  const giveUp = host.clock.after(RECAP_SHOW_MS, stopListening);

  return () => {
    stopListening();
    giveUp();
  };
}

/**
 * Returns what each cell counts `t` ms after the board went up: each climbs from its turn, one a step, to its count.
 * @example
 * countsAt(layout, 600); // [3, 1, 0, 0]
 */
function countsAt(layout: RecapLayout, t: number): number[] {
  return layout.cells.map((cell, i) =>
    Math.min(cell.count, Math.floor(Math.max(0, t - COUNT_FROM - i * CELL_LAG) / STEP_MS)),
  );
}
