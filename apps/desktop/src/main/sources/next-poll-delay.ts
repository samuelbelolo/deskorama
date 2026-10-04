import type { ConnectorFailure, IntervalBounds } from '@deskorama/core';

/** The longest wait between two tries of a failing Source. */
const MAX_BACKOFF_MS = 30 * 60_000;

/** How many polls in a row may skip the wait, so a Feed that always has more cannot poll in a loop. */
const MAX_IMMEDIATE_POLLS = 10;

/** What the last poll of a Source gave. */
export type PollOutcome =
  | {
      readonly ok: true;
      readonly delay?: number | undefined;
      /** How many polls in a row asked for no wait, this one included. */
      readonly immediateInARow: number;
    }
  | { readonly ok: false; readonly failure: ConnectorFailure; readonly failuresInARow: number };

/**
 * Returns how long to wait before polling a Source again, or null to stop until the person edits it. A success
 * follows the Connector's hint within its bounds (0 only for a few polls in a row); a refused token or a missing
 * permission stops; a rate limit waits for its reset; any other failure backs off, doubling up to 30 minutes.
 * @example
 * nextPollDelay({ ok: true, immediateInARow: 0 }, bounds, now); // bounds.default
 * nextPollDelay({ ok: true, delay: 0, immediateInARow: 1 }, bounds, now); // 0
 * nextPollDelay({ ok: false, failure: { kind: 'network' }, failuresInARow: 3 }, bounds, now); // 4 × bounds.default
 * nextPollDelay({ ok: false, failure: { kind: 'auth' }, failuresInARow: 1 }, bounds, now); // null
 */
export function nextPollDelay(outcome: PollOutcome, bounds: IntervalBounds, now: number): number | null {
  if (outcome.ok) {
    if (outcome.delay === 0 && outcome.immediateInARow <= MAX_IMMEDIATE_POLLS) return 0;

    return Math.min(bounds.max, Math.max(bounds.min, outcome.delay ?? bounds.default));
  }

  const { failure } = outcome;

  if (failure.kind === 'auth' || failure.kind === 'permission') return null;

  if (failure.kind === 'rate-limit') return Math.max(bounds.min, failure.resetAt - now);

  // A network failure or an unexpected response: doubling waits, from the default interval.
  return Math.min(MAX_BACKOFF_MS, bounds.default * 2 ** Math.max(0, outcome.failuresInARow - 1));
}
