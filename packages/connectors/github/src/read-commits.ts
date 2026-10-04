import type { Activity } from './activity.ts';
import type { GithubSession } from './create-github-session.ts';
import { COMMITS_SCHEMA, type Commit } from './commit-schema.ts';
import type { Found } from './found.ts';
import { CONTENTS_PERMISSION } from './github-permissions.ts';
import { pushEvent } from './push-event.ts';
import { readRecentPages } from './read-recent-pages.ts';
import type { Scan } from './scan.ts';

/** The newest commits of the default branch, newest first; GitHub lists the default branch without `sha`. */
const PATH = '/commits?per_page=50';

/** What the commits brought, and the newest commit to resume from. */
export interface CommitsFound extends Found {
  readonly head: string | null;
}

/**
 * Reads the default branch's newest commits and returns the push of those that landed after `head`. The first
 * poll only notes the head: commits from before the Source was connected were not pushed today as far as anyone
 * watching knows. When `head` is gone, after a force-push, the commits since `scan.since` count. A push is dated
 * by its newest commit, but never before `scan.since`: a commit written yesterday and pushed today counts today.
 * An empty repository has no commit yet.
 * @example
 * await readCommits(session, { head: 'a1b2…', branch: 'main' }, scan);
 * // { events: [{ kind: 'push', … }], activity: [{ id: 5001, at }], head: 'c3d4…' }
 */
export async function readCommits(
  session: GithubSession,
  previous: { readonly head: string | null; readonly branch: string },
  scan: Scan,
): Promise<CommitsFound> {
  const commits = await readRecentPages(session, {
    path: PATH,
    permission: CONTENTS_PERMISSION,
    schema: COMMITS_SCHEMA,
    what: 'The commits',
    isNew: (commit) => previous.head !== null && commit.sha !== previous.head && commit.committed_at > scan.since,
  });

  if (commits === null || commits[0] === undefined) return { events: [], activity: [], head: previous.head };

  const pushed = previous.head === null ? [] : pushedSince(commits, previous.head, scan.since);

  const pushedAt = Math.max(pushed[0]?.committed_at ?? 0, scan.since);

  const push = pushEvent(pushed, previous.branch, pushedAt, scan);

  const pushedShas = new Set(pushed.map((commit) => commit.sha));

  const activity: Activity[] = commits.flatMap((commit) =>
    commit.author === null
      ? []
      : [{ id: commit.author.id, at: pushedShas.has(commit.sha) ? pushedAt : commit.committed_at }],
  );

  return { events: push === null ? [] : [push], activity, head: commits[0].sha };
}

/**
 * Returns the commits newer than `head`, newest first, or those committed after `since` when `head` is no longer
 * on the branch.
 * @example
 * pushedSince([c3, c2, c1], 'c1-sha', since); // [c3, c2]
 */
function pushedSince(commits: readonly Commit[], head: string, since: number): readonly Commit[] {
  const index = commits.findIndex((commit) => commit.sha === head);

  return index === -1 ? commits.filter((commit) => commit.committed_at > since) : commits.slice(0, index);
}
