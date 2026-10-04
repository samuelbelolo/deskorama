import * as v from 'valibot';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a workflow run. */
export interface Run {
  readonly id: number;
  /** 1 for the first run, then one more for each re-run, which keeps the same id. */
  readonly run_attempt: number;
  /** The workflow's name, such as "CI". */
  readonly name: string | null;
  readonly head_branch: string | null;
  /** `completed` once it finished; `queued`, `in_progress`, `waiting` and the like before. */
  readonly status: string | null;
  /** How it finished, such as `success` or `failure`; null until then. */
  readonly conclusion: string | null;
  readonly updated_at: number;
}

/** One workflow run, as `GET /repos/{owner}/{repo}/actions/runs/{id}` returns it. */
export const RUN_SCHEMA: v.GenericSchema<unknown, Run> = v.object({
  id: v.number(),
  run_attempt: v.optional(v.number(), 1),
  name: v.nullish(v.string(), null),
  head_branch: v.nullable(v.string()),
  status: v.nullable(v.string()),
  conclusion: v.nullable(v.string()),
  updated_at: TIME_SCHEMA,
});

/** `GET /repos/{owner}/{repo}/actions/runs`, newest first; every other field is ignored. */
export const RUNS_SCHEMA: v.GenericSchema<unknown, readonly Run[]> = v.pipe(
  v.object({ workflow_runs: v.array(RUN_SCHEMA) }),
  v.transform((page) => page.workflow_runs),
);
