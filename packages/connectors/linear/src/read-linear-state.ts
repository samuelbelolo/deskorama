import * as v from 'valibot';
import type { LinearState } from './linear-state.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** How far back the first poll looks: the issues of the last hour, not the workspace's whole history. */
const FIRST_LOOKBACK_MS = 60 * 60_000;

/** A persisted cursor of the Linear Connector. */
const SAVED: v.GenericSchema<unknown, LinearState> = v.object({
  since: TIME_SCHEMA,
  from: TIME_SCHEMA,
  after: v.nullable(v.string()),
  newest: TIME_SCHEMA,
});

/**
 * Returns the state a persisted cursor holds. A missing or unreadable one starts over from the last hour, which at
 * worst replays Events the platform drops by id.
 * @example
 * readLinearState(null, 1791122400000);
 * // { since: '2026-10-04T13:00:00.000Z', from: '2026-10-04T13:00:00.000Z', after: null, newest: '2026-10-04T13:00:00.000Z' }
 */
export function readLinearState(saved: string | null, now: number): LinearState {
  const since = new Date(now - FIRST_LOOKBACK_MS).toISOString();

  const start: LinearState = { since, from: since, after: null, newest: since };

  if (saved === null) return start;

  try {
    const parsed = v.safeParse(SAVED, JSON.parse(saved));

    return parsed.success ? parsed.output : start;
  } catch {
    return start;
  }
}
