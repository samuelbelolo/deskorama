import * as v from 'valibot';
import { ACTOR_SCHEMA, type Actor } from './actor-schema.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a pull request; times in milliseconds since the epoch. */
export interface Pull {
  readonly number: number;
  readonly title: string;
  readonly user: Actor | null;
  /** The author's relation to the repository, such as `FIRST_TIME_CONTRIBUTOR`. */
  readonly author_association: string;
  readonly created_at: number;
  readonly updated_at: number;
  readonly closed_at: number | null;
  readonly merged_at: number | null;
}

/** `GET /repos/{owner}/{repo}/pulls`; every other field is ignored. */
export const PULLS_SCHEMA: v.GenericSchema<unknown, readonly Pull[]> = v.array(
  v.object({
    number: v.number(),
    title: v.string(),
    user: ACTOR_SCHEMA,
    author_association: v.string(),
    created_at: TIME_SCHEMA,
    updated_at: TIME_SCHEMA,
    closed_at: v.nullable(TIME_SCHEMA),
    merged_at: v.nullable(TIME_SCHEMA),
  }),
);
