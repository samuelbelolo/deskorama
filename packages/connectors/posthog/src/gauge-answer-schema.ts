import * as v from 'valibot';

/** A count from the query: a whole number, never negative. */
const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));

/** The answer to the counting query, once validated: its one row. */
export interface GaugeAnswer {
  readonly results: readonly [readonly [activeNow: number, signupsToday: number]];
}

/**
 * PostHog's answer to the counting query: one row with the two counts, in the order the query selects them. Its
 * other fields (columns, types, the generated SQL) are ignored.
 * @example
 * { "results": [[14, 37]], "columns": ["active_now", "signups_today"] }
 */
export const GAUGE_ANSWER_SCHEMA: v.GenericSchema<unknown, GaugeAnswer> = v.object({
  results: v.tuple([v.tuple([COUNT, COUNT])]),
});
