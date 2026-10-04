import * as v from 'valibot';

/**
 * What the Sentry Connector resumes from, kept inside the opaque cursor the platform persists. Times follow
 * Sentry's clock, never the Mac's.
 */
export interface SentryState {
  /** The latest time Sentry saw an error once the last catch-up ended, in milliseconds since the epoch. */
  readonly since: number;
  /** Where the next page of a catch-up starts, as Sentry's `cursor`; null once it is read whole. */
  readonly page: string | null;
  /** The latest time an error was seen during this catch-up: `since` moves there after its last page. */
  readonly newest: number;
  /** The ids of the Events already told near `since`, with their times, so the overlap never tells one twice. */
  readonly told: Readonly<Record<string, number>>;
}

/** A persisted cursor of the Sentry Connector. */
export const SENTRY_STATE_SCHEMA: v.GenericSchema<unknown, SentryState> = v.object({
  since: v.number(),
  page: v.nullable(v.string()),
  newest: v.number(),
  told: v.record(v.string(), v.number()),
});
