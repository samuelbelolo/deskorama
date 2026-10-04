import type { PollInput } from '@deskorama/core';
import type { DeploymentStatus } from './deployment-status.ts';
import { DEPLOYMENT_STATUS_SCHEMA } from './deployment-status-schema.ts';
import { getVercel } from './get-vercel.ts';

/**
 * Returns where one deployment stands, read by its id, or null when Vercel no longer knows it (deleted meanwhile).
 * Throws the {@link ConnectorError} any other failed answer means.
 * @example
 * await fetchDeploymentStatus(input, 'dpl_9Xa1'); // { id: 'dpl_9Xa1', readyState: 'ERROR', ready: 1791122280000 }
 */
export async function fetchDeploymentStatus(input: PollInput, id: string): Promise<DeploymentStatus | null> {
  return getVercel(input, `/v13/deployments/${encodeURIComponent(id)}`, {}, DEPLOYMENT_STATUS_SCHEMA, 'A deployment');
}
