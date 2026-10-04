import type { Point } from '@deskorama/core';

/** How finely the flight is sampled to weigh its visible and hidden stretches. */
const STEP = 100;

/** How long a hidden sample lasts, as a share of a visible one. */
const HIDDEN_SHARE = 1 / 3;

/**
 * Returns a clock that spends the hidden part of a flight fast and its visible part slow: the path is sampled every
 * 100 ms of nominal time, a hidden sample lasts a third of a visible one, and the total stays `nominal`, so the
 * flight still ends when the next screen expects it. It maps real elapsed time to nominal time.
 * @example
 * const clock = warpClock(path, 4600, (gear) => planeVisible(host, layout, gear));
 * path(clock(1000)); // further along than path(1000) when the start of the roll is hidden
 */
export function warpClock(
  path: (t: number) => Point,
  nominal: number,
  visible: (gear: Point) => number,
): (real: number) => number {
  const samples = Math.max(1, Math.ceil(nominal / STEP));
  const weights = Array.from(
    { length: samples },
    (_, i) => HIDDEN_SHARE + (1 - HIDDEN_SHARE) * visible(path(Math.min(nominal, (i + 0.5) * STEP))),
  );
  const scale = nominal / (weights.reduce((sum, weight) => sum + weight, 0) * STEP);

  const ends: number[] = [];
  let total = 0;
  for (const weight of weights) {
    total += weight * STEP * scale;
    ends.push(total);
  }

  return (real) => {
    if (real >= total) return nominal;

    const i = ends.findIndex((end) => real < end);
    const start = i === 0 ? 0 : (ends[i - 1] ?? 0);
    const end = ends[i] ?? total;

    return Math.min(nominal, (i + (real - start) / (end - start)) * STEP);
  };
}
