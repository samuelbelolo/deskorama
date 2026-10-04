import * as v from 'valibot';
import type { DeploymentStatus } from './deployment-status.ts';
import { READY_STATES } from './ready-state.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/**
 * The answer of `GET /v13/deployments/{id}`, as Vercel returns it. Only its id, ready state and end time are read.
 * Typed against {@link DeploymentStatus}.
 * @example
 * { "id": "dpl_9Xa1", "name": "tramlo-web", "readyState": "ERROR", "ready": 1791122280000, "target": "production" }
 */
export const DEPLOYMENT_STATUS_SCHEMA: v.GenericSchema<unknown, DeploymentStatus> = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  readyState: v.picklist(READY_STATES),
  ready: v.optional(TIME_SCHEMA),
});
