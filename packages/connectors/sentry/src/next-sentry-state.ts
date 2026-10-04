import type { SentryState } from './sentry-state.ts';

/**
 * Returns where the next poll resumes: on Sentry's next page while there is one, with `since` kept; after the last
 * page, from the latest time an error was seen, keeping only the told ids that the next overlap can still reach.
 * @example
 * nextSentryState(state, null, Date.parse('2026-10-04T13:57:40Z'), { '4821-new': …, '3907-recurring-…': … }, 600000);
 * // { since: 1791122260000, page: null, newest: 1791122260000, told: { … within ten minutes of it } }
 */
export function nextSentryState(
  state: SentryState,
  page: string | null,
  latest: number,
  told: Readonly<Record<string, number>>,
  overlap: number,
): SentryState {
  const newest = Math.max(state.newest, latest);

  if (page !== null) return { since: state.since, page, newest, told };

  const kept = Object.entries(told).filter(([, at]) => at >= newest - overlap);

  return { since: newest, page: null, newest, told: Object.fromEntries(kept) };
}
