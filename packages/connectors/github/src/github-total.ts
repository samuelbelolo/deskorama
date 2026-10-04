import type { GithubState } from './github-state.ts';
import type { Visibility } from './visibility.ts';

/**
 * Returns the total Gauge of a repository: its open issues, without its open pull requests, when it is private,
 * its stars when it is public; null until it was read.
 * @example
 * githubTotal('private', { openItems: 40, openPulls: 3, … }); // 37
 * githubTotal('public', { stars: 2418, … }); // 2418
 */
export function githubTotal(visibility: Visibility, state: GithubState): number | null {
  if (visibility === 'public') return state.stars;

  if (state.openItems === null || state.openPulls === null) return null;

  return Math.max(0, state.openItems - state.openPulls);
}
