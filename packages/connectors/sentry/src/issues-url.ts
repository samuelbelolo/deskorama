import { SENTRY_API } from './sentry-api.ts';

/** The period Sentry's issue search covers, in days, and the longest window asked for. */
const PERIOD_DAYS = 14;

/** The longest window asked for, in minutes. */
const MAX_MINUTES = PERIOD_DAYS * 24 * 60;

/** How many issues one page holds: a larger burst is read page after page. */
const PAGE_SIZE = 100;

/** What narrows the issues of an organization: none of a kind stands for all of them. */
export interface IssueFilters {
  /** The slugs of the projects to read. */
  readonly projects: readonly string[];
  /** The names of the environments to read. */
  readonly environments: readonly string[];
}

/** One page of an organization's issues: the window it covers, and where it starts. */
export interface IssuesPage {
  /** Where the window starts, in milliseconds since the epoch. */
  readonly from: number;
  /** The current time, in milliseconds since the epoch. */
  readonly now: number;
  /** Sentry's cursor for the page, or null for the first one. */
  readonly page: string | null;
}

/**
 * Returns the address of one page of the organization's unresolved issues seen since `from`, latest first, in the
 * picked projects and environments, each sent once under the same name as Sentry asks. Sentry's search only takes a
 * window relative to now, so the window covers the minutes since `from`.
 * @example
 * issuesUrl('tramlo', { projects: ['tramlo-web'], environments: [] }, { from: 1791118200000, now: 1791122400000, page: null });
 * // 'https://sentry.io/api/0/organizations/tramlo/issues/?query=is%3Aunresolved+lastSeen%3A-70m&sort=date…&project=tramlo-web'
 */
export function issuesUrl(organization: string, filters: IssueFilters, { from, now, page }: IssuesPage): string {
  const minutes = Math.min(MAX_MINUTES, Math.max(1, Math.ceil((now - from) / 60_000)));

  const url = new URL(`${SENTRY_API}/organizations/${encodeURIComponent(organization)}/issues/`);

  url.searchParams.set('query', `is:unresolved lastSeen:-${minutes}m`);
  url.searchParams.set('sort', 'date');
  url.searchParams.set('statsPeriod', `${PERIOD_DAYS}d`);
  url.searchParams.set('limit', String(PAGE_SIZE));

  for (const project of filters.projects) url.searchParams.append('project', project);

  for (const environment of filters.environments) url.searchParams.append('environment', environment);

  if (page !== null) url.searchParams.set('cursor', page);

  return url.href;
}
