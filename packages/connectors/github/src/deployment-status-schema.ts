import * as v from 'valibot';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a deployment status. */
export interface DeploymentStatus {
  readonly id: number;
  /** `queued`, `pending`, `in_progress`, `success`, `failure`, `error` or `inactive`. */
  readonly state: string;
  readonly created_at: number;
}

/** `GET /repos/{owner}/{repo}/deployments/{id}/statuses`; every other field is ignored. */
export const DEPLOYMENT_STATUSES_SCHEMA: v.GenericSchema<unknown, readonly DeploymentStatus[]> = v.array(
  v.object({ id: v.number(), state: v.string(), created_at: TIME_SCHEMA }),
);
