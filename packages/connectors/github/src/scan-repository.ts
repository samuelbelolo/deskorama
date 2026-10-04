import type { SourceEvent } from '@deskorama/core';
import type { Activity } from './activity.ts';
import type { GithubSession } from './create-github-session.ts';
import { METADATA_PERMISSION } from './github-permissions.ts';
import type { GithubState } from './github-state.ts';
import { readChanged } from './read-changed.ts';
import { readCommits } from './read-commits.ts';
import { readCounts } from './read-counts.ts';
import { readDeployments } from './read-deployments.ts';
import { readIssues } from './read-issues.ts';
import { readPulls } from './read-pulls.ts';
import { readReleases } from './read-releases.ts';
import { readRuns } from './read-runs.ts';
import { REPOSITORY_SCHEMA } from './repository-schema.ts';
import type { Scan } from './scan.ts';

/** What one poll read from a repository: its Events, who was active, and what the next poll resumes from. */
export interface RepositoryScan {
  readonly events: readonly SourceEvent[];
  readonly activity: readonly Activity[];
  readonly state: Omit<GithubState, 'since' | 'etags' | 'actors'>;
}

/**
 * Reads every list of a repository once, the repository itself first so a token that cannot see it fails before
 * anything else: commits, pull requests and their reviews, issues, releases, workflow runs and deployments. A list
 * that did not change since the previous poll costs a free `304` and brings nothing.
 * @example
 * await scanRepository(session, state, scan); // { events: [ … ], activity: [ … ], state: { branch: 'main', … } }
 */
export async function scanRepository(session: GithubSession, state: GithubState, scan: Scan): Promise<RepositoryScan> {
  const repository = await readChanged(session, '', METADATA_PERMISSION, REPOSITORY_SCHEMA, 'The repository');

  const branch = repository?.default_branch ?? state.branch;

  const commits = await readCommits(session, { head: state.head, branch }, scan);

  const pulls = await readPulls(session, scan);

  const issues = await readIssues(session, scan);

  const releases = await readReleases(session, scan);

  const runs = await readRuns(session, state.runs, branch, scan);

  const deployments = await readDeployments(session, state.deployments, scan);

  const counted =
    repository === null ? { counts: state, events: [] } : await readCounts(session, repository, state, scan);

  const { stars, forks, openItems, openPulls } = counted.counts;

  return {
    events: [
      ...commits.events,
      ...pulls.events,
      ...issues.events,
      ...releases,
      ...runs.events,
      ...deployments.events,
      ...counted.events,
    ],
    activity: [...commits.activity, ...pulls.activity, ...issues.activity],
    state: {
      branch,
      head: commits.head,
      stars,
      forks,
      openItems,
      openPulls,
      runs: runs.unfinished,
      deployments: deployments.unfinished,
    },
  };
}
