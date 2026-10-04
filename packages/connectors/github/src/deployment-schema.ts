import * as v from 'valibot';
import { TIME_SCHEMA } from './time-schema.ts';

/** What the Connector reads of a deployment. */
export interface Deployment {
  readonly id: number;
  /** The branch, tag or commit deployed. */
  readonly ref: string;
  readonly environment: string;
  /** Whether people use what it deployed: GitHub sets it for an environment named "production" by default. */
  readonly production: boolean;
  readonly created_at: number;
}

/** `GET /repos/{owner}/{repo}/deployments`, newest first; every other field is ignored. */
export const DEPLOYMENTS_SCHEMA: v.GenericSchema<unknown, readonly Deployment[]> = v.array(
  v.pipe(
    v.object({
      id: v.number(),
      ref: v.string(),
      environment: v.string(),
      production_environment: v.optional(v.boolean()),
      created_at: TIME_SCHEMA,
    }),
    v.transform(({ production_environment, ...deployment }) => ({
      ...deployment,
      production: production_environment ?? deployment.environment === 'production',
    })),
  ),
);
