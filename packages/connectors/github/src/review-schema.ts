import * as v from 'valibot';
import { ACTOR_SCHEMA, type Actor } from './actor-schema.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a pull request review. */
export interface Review {
  readonly id: number;
  /** `APPROVED`, `CHANGES_REQUESTED`, `COMMENTED`, `DISMISSED` or `PENDING`. */
  readonly state: string;
  readonly user: Actor | null;
  /** Absent while the review is pending. */
  readonly submitted_at: number | null;
}

/** `GET /repos/{owner}/{repo}/pulls/{number}/reviews`; every other field is ignored. */
export const REVIEWS_SCHEMA: v.GenericSchema<unknown, readonly Review[]> = v.array(
  v.object({
    id: v.number(),
    state: v.string(),
    user: ACTOR_SCHEMA,
    submitted_at: v.nullish(TIME_SCHEMA, null),
  }),
);
