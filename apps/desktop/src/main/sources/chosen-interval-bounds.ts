import type { IntervalBounds } from '@deskorama/core';

/**
 * Returns the bounds a Source is polled within once the person chose its interval: the chosen interval, held within
 * the Connector's bounds, becomes both the usual wait and the shortest one, so a hint asking for more frequent polls
 * never spends more of the service's allowance than the person agreed to. A longer hint, up to the Connector's
 * longest wait, is still followed. Without a choice, the Connector's own bounds apply.
 * @example
 * const feed = { min: 30_000, default: 60_000, max: 900_000 };
 * chosenIntervalBounds(feed, 120_000); // { min: 120000, default: 120000, max: 900000 }
 * chosenIntervalBounds(feed, 5_000); // { min: 30000, default: 30000, max: 900000 }
 * chosenIntervalBounds(feed, undefined); // feed
 */
export function chosenIntervalBounds(bounds: IntervalBounds, chosen: number | undefined): IntervalBounds {
  if (chosen === undefined) return bounds;

  const interval = Math.min(bounds.max, Math.max(bounds.min, chosen));

  return { min: interval, default: interval, max: bounds.max };
}
