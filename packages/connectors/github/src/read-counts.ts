import type { SourceEvent } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';
import { forkEvent } from './fork-event.ts';
import type { GithubState } from './github-state.ts';
import { readOpenPulls } from './read-open-pulls.ts';
import type { Repository } from './repository-schema.ts';
import type { Scan } from './scan.ts';
import { starEvents } from './star-events.ts';

/** The counts of a repository kept in the cursor. */
export type Counts = Pick<GithubState, 'stars' | 'forks' | 'openItems' | 'openPulls'>;

/**
 * Returns the counts of a repository that just changed, with the Events of its stars and forks moving. A private
 * repository counts its open issues and never its stars or forks; a public one counts its stars and forks only.
 * @example
 * await readCounts(session, { stargazers_count: 2418, forks_count: 319, … }, previous, publicScan);
 * // { counts: { stars: 2418, forks: 319, openItems: null, openPulls: null }, events: [{ kind: 'star.added', … }] }
 */
export async function readCounts(
  session: GithubSession,
  repository: Repository,
  previous: Counts,
  scan: Scan,
): Promise<{ readonly counts: Counts; readonly events: readonly SourceEvent[] }> {
  if (scan.visibility === 'private') {
    const counts = {
      stars: null,
      forks: null,
      openItems: repository.open_issues_count,
      openPulls: await readOpenPulls(session),
    };

    return { counts, events: [] };
  }

  const { stargazers_count: stars, forks_count: forks } = repository;

  const fork = forkEvent(previous.forks, forks, scan);

  const events = [...starEvents(previous.stars, stars, scan), ...(fork === null ? [] : [fork])];

  return { counts: { stars, forks, openItems: null, openPulls: null }, events };
}
