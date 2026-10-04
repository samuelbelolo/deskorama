import * as v from 'valibot';

/** What the Connector reads of a repository. */
export interface Repository {
  readonly default_branch: string;
  readonly stargazers_count: number;
  readonly forks_count: number;
  /** Open issues and pull requests together. */
  readonly open_issues_count: number;
}

/** `GET /repos/{owner}/{repo}`; every other field is ignored. */
export const REPOSITORY_SCHEMA: v.GenericSchema<unknown, Repository> = v.object({
  default_branch: v.string(),
  stargazers_count: v.number(),
  forks_count: v.number(),
  open_issues_count: v.number(),
});
