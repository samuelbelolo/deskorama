import * as v from 'valibot';
import type { DeploymentList } from './deployment-list.ts';
import { READY_STATES } from './ready-state.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/**
 * A page of `GET /v7/deployments`, as Vercel returns it. Only the fields the Connector reads are checked, so Vercel
 * may add others; a deployment without a known ready state is refused. Typed against {@link DeploymentList}.
 * @example
 * { "deployments": [{ "uid": "dpl_7Hq2", "name": "tramlo-web", "created": 1791119400000, "readyState": "READY",
 *   "target": "production", "ready": 1791119700000, "meta": { "githubCommitRef": "main" } }],
 *   "pagination": { "count": 1, "next": null, "prev": 1791119400000 } }
 */
export const DEPLOYMENT_LIST_SCHEMA: v.GenericSchema<unknown, DeploymentList> = v.object({
  deployments: v.array(
    v.object({
      uid: v.pipe(v.string(), v.nonEmpty()),
      name: v.string(),
      created: TIME_SCHEMA,
      readyState: v.picklist(READY_STATES),
      target: v.nullish(v.string()),
      ready: v.optional(TIME_SCHEMA),
      meta: v.optional(v.record(v.string(), v.unknown())),
    }),
  ),
  pagination: v.object({ next: v.nullable(TIME_SCHEMA) }),
});
