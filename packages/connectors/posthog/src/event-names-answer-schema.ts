import * as v from 'valibot';

/** The answer to the query of event names, once validated: one row per name. */
export interface EventNamesAnswer {
  readonly results: readonly (readonly [name: string])[];
}

/**
 * PostHog's answer to the query of event names: one row per name. Its other fields are ignored.
 * @example
 * { "results": [["$pageview"], ["user_signed_up"]], "columns": ["event"] }
 */
export const EVENT_NAMES_SCHEMA: v.GenericSchema<unknown, EventNamesAnswer> = v.object({
  results: v.array(v.tuple([v.string()])),
});
