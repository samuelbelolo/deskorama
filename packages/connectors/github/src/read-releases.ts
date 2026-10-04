import type { SourceEvent } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';
import { CONTENTS_PERMISSION } from './github-permissions.ts';
import { readRecentPages } from './read-recent-pages.ts';
import { releaseEvent } from './release-event.ts';
import { RELEASES_SCHEMA } from './release-schema.ts';
import type { Scan } from './scan.ts';

/** The releases created last. */
const PATH = '/releases?per_page=10';

/**
 * Reads the releases created last and returns those published since `scan.since`.
 * @example
 * await readReleases(session, scan); // [{ kind: 'release.published', … }]
 */
export async function readReleases(session: GithubSession, scan: Scan): Promise<SourceEvent[]> {
  const releases = await readRecentPages(session, {
    path: PATH,
    permission: CONTENTS_PERMISSION,
    schema: RELEASES_SCHEMA,
    what: 'The releases',
    isNew: (release) => release.published_at === null || release.published_at > scan.since,
  });

  return (releases ?? []).flatMap((release) => releaseEvent(release, scan) ?? []);
}
