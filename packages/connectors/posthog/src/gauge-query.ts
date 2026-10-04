/**
 * The one query the Connector runs: two counts, never a row of events, since PostHog refuses connectors that export
 * through its query API. The people active in the last 5 minutes, and the sign-up events since midnight, as PostHog
 * dates the project's days. It reads from the start of the day 5 minutes ago, which holds both windows, even just
 * after midnight and on a day the clocks change. The sign-up event's name travels as a value, never inside the
 * query's text.
 */
const GAUGE_QUERY = `
SELECT
  uniqIf(person_id, timestamp >= now() - INTERVAL 5 MINUTE) AS active_now,
  countIf(event = {signup} AND timestamp >= toStartOfDay(now())) AS signups_today
FROM events
WHERE timestamp >= toStartOfDay(now() - INTERVAL 5 MINUTE)
`.trim();

/**
 * Returns the body of the query request: the counting query, the sign-up event's name as its value, a fresh count
 * every time, and a name that finds it in the project's query log.
 * @example
 * gaugeQuery('user_signed_up');
 * // '{"query":{"kind":"HogQLQuery","query":"SELECT …","values":{"signup":"user_signed_up"}},"refresh":"force_blocking","name":"…"}'
 */
export function gaugeQuery(signupEvent: string): string {
  return JSON.stringify({
    query: { kind: 'HogQLQuery', query: GAUGE_QUERY, values: { signup: signupEvent } },
    // PostHog would otherwise answer from its cache for hours: counts of right now must be counted now.
    refresh: 'force_blocking',
    name: 'Deskorama Gauges',
  });
}
