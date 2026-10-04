import * as v from 'valibot';
import { ACTOR_SCHEMA, type Actor } from './actor-schema.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of an issue. */
export interface Issue {
  readonly number: number;
  readonly title: string;
  readonly user: Actor | null;
  readonly created_at: number;
  /** True for a pull request, which GitHub lists among issues too. */
  readonly is_pull: boolean;
}

/** `GET /repos/{owner}/{repo}/issues`; every other field is ignored. */
export const ISSUES_SCHEMA: v.GenericSchema<unknown, readonly Issue[]> = v.array(
  v.pipe(
    v.object({
      number: v.number(),
      title: v.string(),
      user: ACTOR_SCHEMA,
      created_at: TIME_SCHEMA,
      pull_request: v.optional(v.unknown()),
    }),
    v.transform(({ pull_request, ...issue }) => ({ ...issue, is_pull: pull_request !== undefined })),
  ),
);
