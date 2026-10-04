import type { SourceEvent } from '@deskorama/core';
import type { Commit } from './commit-schema.ts';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of commits that reached the default branch since the previous poll, newest first: one push,
 * at `at`, that raises today's commits by their number. Null when there are none.
 * @example
 * pushEvent([newest, older, oldest], 'main', pushedAt, scan);
 * // { kind: 'push', archetype: 'usage', text: { en: { detail: '3 commits on main', tag: '+3' } }, gauge: { role: 'daily', by: 3 } }
 */
export function pushEvent(commits: readonly Commit[], branch: string, at: number, scan: Scan): SourceEvent | null {
  const newest = commits[0];

  if (newest === undefined) return null;

  const count = commits.length;

  const noun = count > 1 ? 'commits' : 'commit';

  return githubEvent(scan.source, {
    id: `push-${newest.sha}`,
    kind: 'push',
    archetype: 'usage',
    rarity: 'common',
    at,
    gauge: { role: 'daily', by: count },
    text: eventText(
      { fr: `Commits poussés sur ${branch}`, en: `Commits pushed to ${branch}` },
      { fr: `${count} ${noun} sur ${branch}`, en: `${count} ${noun} on ${branch}` },
      `+${count}`,
    ),
  });
}
