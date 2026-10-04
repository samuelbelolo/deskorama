import type { PollInput, PollResult } from '@deskorama/core';
import { createGithubSession } from './create-github-session.ts';
import { REPOSITORY_FIELD } from './github-config.ts';
import type { GithubState } from './github-state.ts';
import { githubTotal } from './github-total.ts';
import { orderEvents } from './order-events.ts';
import { readGithubState } from './read-github-state.ts';
import { recentActors } from './recent-actors.ts';
import { repositoryName } from './repository-name.ts';
import { scanRepository } from './scan-repository.ts';
import type { Visibility } from './visibility.ts';

/** How far back the first poll looks, so a Source just connected shows its latest Events. */
const LOOKBACK = 24 * 3_600_000;

/**
 * How far before the previous poll the next one looks again: GitHub's lists can show a change a little after it
 * happened, and the platform drops what was already reported by id. The window starts from GitHub's clock when it
 * gave one, since the times it compares are GitHub's: a Mac running fast would otherwise skip what happened between.
 */
const OVERLAP = 5 * 60_000;

/**
 * Polls a GitHub repository once and returns what happened since the previous poll, oldest first, the crowd and
 * total Gauges, the cursor to resume from, and the wait GitHub asked for, if any.
 * @example
 * await pollGithub('private', { settings: { name: 'Tramlo', values: { repository: 'tramlo/tramlo-app' }, token },
 *   cursor: null, fetch, now });
 * // { events: [ … ], gauges: { crowd: 3, total: 37 }, cursor: '{"since":…}' }
 */
export async function pollGithub(visibility: Visibility, input: PollInput): Promise<PollResult> {
  const repository = repositoryName(input.settings.values[REPOSITORY_FIELD] ?? '');

  const state = readGithubState(input.cursor);

  const session = createGithubSession({
    base: `https://api.github.com/repos/${repository}`,
    token: input.settings.token,
    fetch: input.fetch,
    now: input.now,
    etags: state.etags,
  });

  const scan = { source: input.settings.name, since: state.since ?? input.now - LOOKBACK, now: input.now, visibility };

  const found = await scanRepository(session, state, scan);

  const next: GithubState = {
    ...found.state,
    since: (session.serverTime() ?? input.now) - OVERLAP,
    etags: session.etags(),
    actors: recentActors(state.actors, found.activity, input.now),
  };

  const total = githubTotal(visibility, next);

  const wait = session.wait();

  return {
    events: orderEvents(found.events),
    gauges: { crowd: Object.keys(next.actors).length, ...(total === null ? {} : { total }) },
    cursor: JSON.stringify(next),
    ...(wait === undefined ? {} : { delay: wait }),
  };
}
