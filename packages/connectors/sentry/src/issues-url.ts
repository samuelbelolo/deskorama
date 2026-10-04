/** The period Sentry's issue search covers, in days, and the longest window asked for. */
const PERIOD_DAYS = 14;

/** The longest window asked for, in minutes. */
const MAX_MINUTES = PERIOD_DAYS * 24 * 60;

/** How many issues one page holds: a larger burst is read page after page. */
const PAGE_SIZE = 100;

/**
 * Returns the address of one page of the organization's unresolved issues seen since `from`, latest first. Sentry's
 * search only takes a window relative to now, so the window covers the minutes since `from`.
 * @example
 * issuesUrl('tramlo', 1791118200000, 1791122400000, null);
 * // 'https://sentry.io/api/0/organizations/tramlo/issues/?query=is%3Aunresolved+lastSeen%3A-70m&sort=date…'
 */
export function issuesUrl(organization: string, from: number, now: number, page: string | null): string {
  const minutes = Math.min(MAX_MINUTES, Math.max(1, Math.ceil((now - from) / 60_000)));

  const url = new URL(`https://sentry.io/api/0/organizations/${encodeURIComponent(organization)}/issues/`);

  url.searchParams.set('query', `is:unresolved lastSeen:-${minutes}m`);
  url.searchParams.set('sort', 'date');
  url.searchParams.set('statsPeriod', `${PERIOD_DAYS}d`);
  url.searchParams.set('limit', String(PAGE_SIZE));

  if (page !== null) url.searchParams.set('cursor', page);

  return url.href;
}
