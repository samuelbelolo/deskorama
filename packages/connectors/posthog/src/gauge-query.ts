/**
 * Returns the one query a poll runs, the sign-up events named by `placeholders`: two counts, never a row of events,
 * since PostHog refuses connectors that export through its query API. The people active in the last 5 minutes, and
 * the sign-up events since midnight, whichever of the names they bear, as PostHog dates the project's days. It reads
 * from the start of the day 5 minutes ago, which holds both windows, even just after midnight and on a day the clocks
 * change. Each name has its own placeholder: none is ever written inside the query's text.
 * @example
 * gaugeSql(['signup_0', 'signup_1']);
 * // 'SELECT … countIf((event = {signup_0} OR event = {signup_1}) AND timestamp >= toStartOfDay(now())) AS signups_today …'
 */
function gaugeSql(placeholders: readonly string[]): string {
  const isSignup = placeholders.map((placeholder) => `event = {${placeholder}}`).join(' OR ');

  return `
SELECT
  uniqIf(person_id, timestamp >= now() - INTERVAL 5 MINUTE) AS active_now,
  countIf((${isSignup}) AND timestamp >= toStartOfDay(now())) AS signups_today
FROM events
WHERE timestamp >= toStartOfDay(now() - INTERVAL 5 MINUTE)
`.trim();
}

/**
 * Returns the body of the query request: the counting query, the names of the sign-up events as its values, each
 * under the placeholder the query gives it, a fresh count every time, and a name that finds it in the project's
 * query log.
 * @example
 * gaugeQuery(['user_signed_up', 'team_created']);
 * // '{"query":{"kind":"HogQLQuery","query":"SELECT …","values":{"signup_0":"user_signed_up","signup_1":"team_created"}},"refresh":"force_blocking","name":"…"}'
 */
export function gaugeQuery(signupEvents: readonly string[]): string {
  const named = signupEvents.map((name, index) => [`signup_${index}`, name] as const);

  const query = gaugeSql(named.map(([placeholder]) => placeholder));

  return JSON.stringify({
    query: { kind: 'HogQLQuery', query, values: Object.fromEntries(named) },
    // PostHog would otherwise answer from its cache for hours: counts of right now must be counted now.
    refresh: 'force_blocking',
    name: 'Deskorama Gauges',
  });
}
