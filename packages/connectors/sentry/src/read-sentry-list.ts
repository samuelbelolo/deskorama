import type { ConnectorOption, OptionsInput, StandardSchema } from '@deskorama/core';
import { getSentry } from './get-sentry.ts';
import { SENTRY_API } from './sentry-api.ts';
import { SENTRY_LIST_PERMISSION } from './sentry-config.ts';

/** How many items one page holds, the most Sentry gives. */
const PAGE_SIZE = 100;

/** How many pages of a list are read at most: what lies beyond is typed by hand. */
const MAX_PAGES = 5;

/** One list of Sentry: where it is read, how its answer becomes options, and what the list is called in a failure. */
export interface SentryList {
  /** The path under the API's root, e.g. "/organizations/". */
  readonly path: string;
  readonly schema: StandardSchema<ConnectorOption[]>;
  readonly what: string;
}

/**
 * Returns the options of one of Sentry's lists, read with the token page after page, as its `Link` header says
 * there are more, five pages at most. Throws the {@link ConnectorError} a failed answer means, a refusal naming
 * `org:read`, the scope every list needs.
 * @example
 * await readSentryList(input, { path: '/organizations/', schema: ORGANIZATION_OPTIONS_SCHEMA, what: 'The organizations' });
 * // [{ value: 'tramlo', label: 'Tramlo' }]
 */
export async function readSentryList(input: OptionsInput, list: SentryList): Promise<ConnectorOption[]> {
  return readPages(input, list, null, MAX_PAGES);
}

/**
 * Returns the options of the page of a list that Sentry's cursor `page` names, the first one for null, and of the
 * pages after it, `left` pages at most.
 * @example
 * await readPages(input, { path: '/organizations/tramlo/projects/', schema: PROJECT_OPTIONS_SCHEMA, what: 'The projects' }, null, 5);
 * // [{ value: 'tramlo-web', label: 'tramlo-web' }, …]
 */
async function readPages(
  input: OptionsInput,
  list: SentryList,
  page: string | null,
  left: number,
): Promise<ConnectorOption[]> {
  const url = new URL(`${SENTRY_API}${list.path}`);

  url.searchParams.set('per_page', String(PAGE_SIZE));

  if (page !== null) url.searchParams.set('cursor', page);

  const read = { schema: list.schema, what: list.what, permission: SENTRY_LIST_PERMISSION };

  const { payload: options, next } = await getSentry(input, url.href, read);

  if (next === null || left <= 1) return options;

  return [...options, ...(await readPages(input, list, next, left - 1))];
}
