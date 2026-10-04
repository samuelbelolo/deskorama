import { ConnectorError, parsePayload, type StandardSchema } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';
import { hasNextPage } from './has-next-page.ts';

/** At most this many pages of one list in a poll, so a busy night is caught up without draining the rate limit. */
const MAX_PAGES = 5;

/** What reading one list needs: where, with which permission, how to validate a page, and which items are new. */
export interface RecentList<Item> {
  /** The address of the first page, with a query string, such as `/pulls?state=all&per_page=30`. */
  readonly path: string;
  readonly permission: string;
  readonly schema: StandardSchema<readonly Item[]>;
  readonly what: string;
  /** Whether an item is new, so a page that ends on a new item may have more on the next one. */
  readonly isNew: (item: Item) => boolean;
}

/**
 * Returns the items of a list sorted newest first, or null when its first page did not change since the previous
 * poll. While a page ends on a new item and GitHub links a next one, the next pages are read too, up to five, so
 * nothing new is left behind after a night away. A `404` means the token cannot reach the list.
 * @example
 * await readRecentPages(session, { path: '/pulls?…', permission, schema: PULLS_SCHEMA, what: 'The pull requests',
 *   isNew: (pull) => pull.updated_at > since }); // [pull418, pull412, …], or null after a 304
 */
export async function readRecentPages<Item>(
  session: GithubSession,
  list: RecentList<Item>,
): Promise<readonly Item[] | null> {
  const answer = await session.get(list.path, list.permission);

  if (answer.kind === 'unchanged') return null;

  if (answer.kind === 'empty') return [];

  if (answer.kind === 'missing') {
    throw new ConnectorError(
      { kind: 'permission', permission: list.permission },
      `GitHub answered 404 for ${list.what}.`,
    );
  }

  const items = await parsePayload(list.schema, answer.body, list.what);

  return [...items, ...(await nextPages(session, list, items, answer.headers.get('link'), 2))];
}

/**
 * Returns the items of the pages after `page - 1`, while the previous page ended on a new item and linked a next
 * one, read without ETag since their content shifts as the list grows.
 * @example
 * await nextPages(session, list, firstPage, link, 2); // the items of pages 2, 3… while they are new
 */
async function nextPages<Item>(
  session: GithubSession,
  list: RecentList<Item>,
  previous: readonly Item[],
  link: string | null,
  page: number,
): Promise<readonly Item[]> {
  const last = previous.at(-1);

  if (page > MAX_PAGES || last === undefined || !list.isNew(last) || !hasNextPage(link)) return [];

  const answer = await session.get(`${list.path}&page=${page}`, list.permission, { conditional: false });

  if (answer.kind !== 'changed') return [];

  const items = await parsePayload(list.schema, answer.body, list.what);

  return [...items, ...(await nextPages(session, list, items, answer.headers.get('link'), page + 1))];
}
