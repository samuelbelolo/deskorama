/** How many names are asked for: as many as the settings window shows for one field, so no list is cut twice. */
const MAX_NAMES = 500;

/**
 * The query that lists the names of the events a project received in the last 30 days: one row per name, never a
 * row per event, so nothing is exported. The product's own names come before those PostHog captures by itself,
 * whose names start with `$`, and the most frequent first among each: a sign-up is rare beside a page view, and
 * must not be the name the limit cuts. A month reads more than a week would, for a query that runs once per list
 * and that PostHog may answer from its cache.
 */
const EVENT_NAMES_QUERY = `
SELECT event
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY event
ORDER BY event LIKE '$%', count() DESC
LIMIT ${MAX_NAMES}
`.trim();

/**
 * Returns the body of the request that lists a project's event names, under a name that finds it in the project's
 * query log. PostHog may answer from its cache: names change slowly.
 * @example
 * eventNamesQuery(); // '{"query":{"kind":"HogQLQuery","query":"SELECT event FROM events …"},"name":"…"}'
 */
export function eventNamesQuery(): string {
  return JSON.stringify({
    query: { kind: 'HogQLQuery', query: EVENT_NAMES_QUERY },
    name: 'Deskorama event names',
  });
}
