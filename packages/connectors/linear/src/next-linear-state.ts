import type { LinearIssuePage } from './linear-issues.ts';
import type { LinearState } from './linear-state.ts';

/**
 * Returns where the next poll resumes: on the next page while Linear has one, with `since` and `from` kept; after the
 * last page, from the newest update seen, telling what happened since this catch-up's own start when it took several
 * pages, since an issue edited meanwhile may have slipped past them.
 * @example
 * nextLinearState({ since, from: since, after: null, newest: since }, { nodes: [issue], pageInfo: { hasNextPage: false, endCursor: 'c' } });
 * // { since: issue.updatedAt, from: issue.updatedAt, after: null, newest: issue.updatedAt }
 */
export function nextLinearState(state: LinearState, page: LinearIssuePage): LinearState {
  const newest = page.nodes
    .map((issue) => issue.updatedAt)
    .reduce((latest, update) => (Date.parse(update) > Date.parse(latest) ? update : latest), state.newest);

  const { hasNextPage, endCursor } = page.pageInfo;

  if (hasNextPage && endCursor !== null) return { ...state, after: endCursor, newest };

  return { since: newest, from: state.after === null ? newest : state.since, after: null, newest };
}
