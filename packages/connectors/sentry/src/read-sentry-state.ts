import * as v from 'valibot';
import { SENTRY_STATE_SCHEMA, type SentryState } from './sentry-state.ts';

/** How far back the first poll looks: the errors of the last hour, not the organization's whole history. */
const FIRST_LOOKBACK_MS = 60 * 60_000;

/**
 * Returns the state a persisted cursor holds. A missing or unreadable one starts over from the last hour, which at
 * worst replays Events the platform drops by id.
 * @example
 * readSentryState(null, 1791122400000); // { since: 1791118800000, page: null, newest: 1791118800000, told: {} }
 */
export function readSentryState(saved: string | null, now: number): SentryState {
  const since = now - FIRST_LOOKBACK_MS;

  const start: SentryState = { since, page: null, newest: since, told: {} };

  if (saved === null) return start;

  try {
    const parsed = v.safeParse(SENTRY_STATE_SCHEMA, JSON.parse(saved));

    return parsed.success ? parsed.output : start;
  } catch {
    return start;
  }
}
