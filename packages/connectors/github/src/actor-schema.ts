import * as v from 'valibot';

/** A GitHub account as a resource names it: only its id is kept, to count contributors, never their name. */
export interface Actor {
  readonly id: number;
}

/** An account, or null for a deleted one or a commit with no linked account. */
export const ACTOR_SCHEMA: v.GenericSchema<unknown, Actor | null> = v.nullable(v.object({ id: v.number() }));
