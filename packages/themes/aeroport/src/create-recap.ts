import type { Cancel, Rect, Recap, ScreenHost } from '@deskorama/core';
import { showRecapBelt } from './show-recap-belt.ts';
import type { Strings } from './strings.ts';

/** How long the belt shows: under the eight seconds the engine waits before replaying a missed failed deploy. */
export const RECAP_SHOW_MS = 7600;

/** The smallest and the largest the panel gets. */
const SMALLEST = { w: 300, h: 100 } as const;
const LARGEST = { w: 1100, h: 150 } as const;
const NARROW = 700;
const TALLEST = 210;

/**
 * Listens for the recap of what was missed while the wallpaper was hidden and shows it on a baggage claim belt in
 * the largest visible box, reserved while it shows: the title and how long and how much was missed, then one still
 * suitcase per Role, rarest first, under which the belt runs. When no box is big enough, it waits for a window to
 * move until its time is up. Returns what stops listening and takes the belt down.
 * @example
 * const stop = createRecap(root, host, textFor(host.lang));
 */
export function createRecap(root: HTMLElement, host: ScreenHost, text: Strings): Cancel {
  let showing: Cancel | null = null;
  let waiting: Cancel | null = null;

  const show = (recap: Recap, until: number): boolean => {
    const rect = beltRect(host);
    if (rect === null) return false;

    showing?.();
    showing = showRecapBelt(root, host, { recap, rect, until }, text, () => {
      showing = null;
    });

    return true;
  };

  /** Waits for a window to move and leave room for `recap`, until its time is up; a newer recap ends the wait. */
  const wait = (recap: Recap, until: number): void => {
    const stop = (): void => {
      stopListening();
      giveUp();
      if (waiting === stop) waiting = null;
    };
    const stopListening = host.onVisibility(() => {
      if (host.clock.now() < until - 1000 && show(recap, until)) stop();
    });
    const giveUp = host.clock.after(until - host.clock.now(), stop);

    waiting = stop;
  };

  const stopRecaps = host.onRecap((recap) => {
    waiting?.();
    const until = host.clock.now() + RECAP_SHOW_MS;
    if (!show(recap, until)) wait(recap, until);
  });

  return () => {
    stopRecaps();
    waiting?.();
    showing?.();
  };
}

/**
 * Returns the panel's box: the largest visible rectangle, cut to belt proportions and set at its bottom, or null when
 * it is too small.
 * @example
 * beltRect(host); // { x: 0, y: 690, w: 960, h: 150 } with a strip of ground visible
 */
function beltRect(host: ScreenHost): Rect | null {
  const free = host.largestFree({ skipHeld: true });
  if (free === null || free.w < SMALLEST.w || free.h < SMALLEST.h) return null;

  const w = Math.min(free.w, LARGEST.w);
  // A narrow panel grows taller, to stack its suitcases in rows.
  const h = Math.min(free.h, w < NARROW ? TALLEST : LARGEST.h);

  return { x: free.x + (free.w - w) / 2, y: free.y + free.h - h, w, h };
}
