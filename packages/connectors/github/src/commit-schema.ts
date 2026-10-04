import * as v from 'valibot';
import { ACTOR_SCHEMA, type Actor } from './actor-schema.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a commit: who wrote it, by account id, and when it landed. */
export interface Commit {
  readonly sha: string;
  readonly author: Actor | null;
  /** When it was committed, which for a merge or a rebase is when it reached the branch. */
  readonly committed_at: number;
}

/** `GET /repos/{owner}/{repo}/commits`, newest first; every other field is ignored. */
export const COMMITS_SCHEMA: v.GenericSchema<unknown, readonly Commit[]> = v.array(
  v.pipe(
    v.object({
      sha: v.string(),
      author: ACTOR_SCHEMA,
      commit: v.object({ committer: v.object({ date: TIME_SCHEMA }) }),
    }),
    v.transform(({ sha, author, commit }) => ({ sha, author, committed_at: commit.committer.date })),
  ),
);
