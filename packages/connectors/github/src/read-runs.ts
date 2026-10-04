import type { SourceEvent } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';
import { ACTIONS_PERMISSION } from './github-permissions.ts';
import { inSequence } from './in-sequence.ts';
import { readFollowed } from './read-followed.ts';
import { readRecentPages } from './read-recent-pages.ts';
import { runFailedEvent } from './run-event.ts';
import { RUN_SCHEMA, RUNS_SCHEMA } from './run-schema.ts';
import type { Scan } from './scan.ts';

/** The runs created last; the address never changes, so its ETag changes only when a run does. */
const PATH = '/actions/runs?per_page=30&exclude_pull_requests=true';

/** At most this many unfinished runs are followed, the newest ones. */
const MAX_TRACKED = 20;

/** What the runs brought, and the runs still going. */
export interface RunsFound {
  readonly events: readonly SourceEvent[];
  readonly unfinished: readonly number[];
}

/**
 * Reads the runs created last, then reads by id each unfinished run the list no longer shows, so a run that goes
 * red after many others started is never missed. Returns the runs that finished red, named after the default
 * `branch` only, and those still going.
 * @example
 * await readRuns(session, [5101], 'main', scan); // { events: [{ kind: 'ci.failed', … }], unfinished: [5102] }
 */
export async function readRuns(
  session: GithubSession,
  tracked: readonly number[],
  branch: string,
  scan: Scan,
): Promise<RunsFound> {
  const listed =
    (await readRecentPages(session, {
      path: PATH,
      permission: ACTIONS_PERMISSION,
      schema: RUNS_SCHEMA,
      what: 'The workflow runs',
      isNew: (run) => run.updated_at > scan.since,
    })) ?? [];

  const listedIds = new Set(listed.map((run) => run.id));

  const events = listed.flatMap((run) =>
    run.updated_at > scan.since ? (runFailedEvent(run, branch, scan) ?? []) : [],
  );

  const unfinished = listed.filter((run) => run.status !== 'completed').map((run) => run.id);

  const gone = tracked.filter((id) => !listedIds.has(id));

  const reread = await inSequence(gone, async (id) => ({
    id,
    run: await readFollowed(session, `/actions/runs/${id}`, ACTIONS_PERMISSION, RUN_SCHEMA, 'The workflow run'),
  }));

  for (const { id, run } of reread) {
    if (run === null) continue;

    if (run === 'unchanged' || run.status !== 'completed') {
      unfinished.push(id);

      continue;
    }

    const failed = runFailedEvent(run, branch, scan);

    if (failed !== null) events.push(failed);
  }

  return { events, unfinished: unfinished.toSorted((a, b) => b - a).slice(0, MAX_TRACKED) };
}
