import { EASE } from './ease.ts';
import { DRIVE_MS, GENERIC_GAG_MS, STOP_MS } from './freight-timing.ts';
import { lerp } from './lerp.ts';

/** Where the tug is and how visible, at one instant of the generic Gag. */
export interface FreightPose {
  readonly x: number;
  readonly opacity: number;
}

/** Where the tug enters, stops and leaves, in pixels from the left of the screen. */
export interface FreightPath {
  readonly enter: number;
  readonly stop: number;
  readonly exit: number;
}

/**
 * Returns the tug's pose `elapsed` milliseconds into the generic Gag: a pure function of time, so any frame can be
 * drawn or tested on its own.
 * @example
 * freightPose(0, { enter: 792, stop: 432, exit: 72 }); // { x: 792, opacity: 0 }
 * freightPose(2000, { enter: 792, stop: 432, exit: 72 }); // { x: 432, opacity: 1 }
 */
export function freightPose(elapsed: number, path: FreightPath): FreightPose {
  const t = Math.min(Math.max(elapsed, 0), GENERIC_GAG_MS);
  const arriving = EASE.out(Math.min(1, t / DRIVE_MS));
  const leaving = EASE.in(Math.max(0, (t - DRIVE_MS - STOP_MS) / DRIVE_MS));
  const x = t < DRIVE_MS + STOP_MS ? lerp(path.enter, path.stop, arriving) : lerp(path.stop, path.exit, leaving);

  return { x, opacity: fade(t / GENERIC_GAG_MS) };
}

/**
 * Returns the tug's opacity at `progress` (0 to 1) of the Gag: it fades in over the first 8 %, out over the last 10 %.
 * @example
 * fade(0.04); // 0.5
 * fade(0.5); // 1
 */
function fade(progress: number): number {
  if (progress < 0.08) return progress / 0.08;
  if (progress > 0.9) return Math.max(0, (1 - progress) / 0.1);

  return 1;
}
