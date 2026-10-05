import type { SentRequest } from '@deskorama/test-utils';
import * as v from 'valibot';

/**
 * The body of a query request, as far as the tests read it. The values and the refresh go with the counting query
 * only: the query of event names has no placeholder and may be answered from PostHog's cache.
 */
interface AskedQuery {
  readonly query: {
    readonly kind: string;
    readonly query: string;
    readonly values?: Record<string, string> | undefined;
  };
  readonly refresh?: string | undefined;
}

const QUERY_BODY: v.GenericSchema<unknown, AskedQuery> = v.object({
  query: v.object({ kind: v.string(), query: v.string(), values: v.optional(v.record(v.string(), v.string())) }),
  refresh: v.optional(v.string()),
});

/**
 * Returns what the first request of `sent` asked PostHog: its query, the values that go with it, and whether it
 * asks for a fresh answer.
 * @example
 * askedOf(sent).query.values; // { signup_0: 'user_signed_up', signup_1: 'team_created' }
 * askedOf(sent).refresh; // 'force_blocking'
 */
export function askedOf(sent: readonly SentRequest[]): AskedQuery {
  return v.parse(QUERY_BODY, JSON.parse(sent[0]?.init.body ?? '{}'));
}
