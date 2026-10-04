import type { SourceEvent } from '@deskorama/core';
import type { Activity } from './activity.ts';
import type { GithubSession } from './create-github-session.ts';
import type { Found } from './found.ts';
import { PULL_REQUESTS_PERMISSION } from './github-permissions.ts';
import { pullEvents } from './pull-events.ts';
import { PULLS_SCHEMA } from './pull-schema.ts';
import { readRecentPages } from './read-recent-pages.ts';
import { readReviews } from './read-reviews.ts';
import type { Scan } from './scan.ts';

/** The pull requests touched last, whatever their state: GitHub's pulls list has no `since`. */
const PATH = '/pulls?state=all&sort=updated&direction=desc&per_page=30';

/**
 * Reads the pull requests touched since `scan.since` and returns those opened, merged or closed since then, with
 * the reviews submitted on them.
 * @example
 * await readPulls(session, scan); // { events: [{ kind: 'pull_request.merged', … }, …], activity: [ … ] }
 */
export async function readPulls(session: GithubSession, scan: Scan): Promise<Found> {
  const pulls = await readRecentPages(session, {
    path: PATH,
    permission: PULL_REQUESTS_PERMISSION,
    schema: PULLS_SCHEMA,
    what: 'The pull requests',
    isNew: (pull) => pull.updated_at > scan.since,
  });

  if (pulls === null) return { events: [], activity: [] };

  const events: SourceEvent[] = pulls.flatMap((pull) => pullEvents(pull, scan));

  const activity: Activity[] = pulls.flatMap((pull) =>
    pull.user === null ? [] : [{ id: pull.user.id, at: pull.created_at }],
  );

  const reviews = await readReviews(
    session,
    pulls.filter((pull) => pull.updated_at > scan.since),
    scan,
  );

  return { events: [...events, ...reviews.events], activity: [...activity, ...reviews.activity] };
}
