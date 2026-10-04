import type { TrackedDeployment } from './tracked-deployment.ts';

/**
 * What a GitHub Connector resumes from, kept inside the opaque cursor the platform persists. Every time is in
 * milliseconds since the epoch.
 */
export interface GithubState {
  /** Things that happened after this time are new; null before the first poll. */
  readonly since: number | null;
  /** The ETag of the last answer to each address read on the previous poll, for a `304 Not Modified`. */
  readonly etags: Readonly<Record<string, string>>;
  /** The default branch, where pushes are counted. */
  readonly branch: string;
  /** The newest commit seen on the default branch. */
  readonly head: string | null;
  readonly stars: number | null;
  readonly forks: number | null;
  /** Open issues and pull requests together, as GitHub counts them on the repository. */
  readonly openItems: number | null;
  readonly openPulls: number | null;
  /** Workflow runs seen unfinished, read again by id until they finish. */
  readonly runs: readonly number[];
  /** Deployments seen unfinished, read again by id until they finish. */
  readonly deployments: readonly TrackedDeployment[];
  /** When each contributor, by GitHub account id, last did something, within the last hour. */
  readonly actors: Readonly<Record<string, number>>;
}

/** Where nothing was read yet. */
export const START: GithubState = {
  since: null,
  etags: {},
  branch: 'main',
  head: null,
  stars: null,
  forks: null,
  openItems: null,
  openPulls: null,
  runs: [],
  deployments: [],
  actors: {},
};
