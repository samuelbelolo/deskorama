import type { PollInput } from '@deskorama/core';
import { fetchDeploymentStatus } from './fetch-deployment-status.ts';
import type { Observation } from './observation.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/**
 * Reads each unfinished deployment again by its id and returns how this poll saw it; one Vercel no longer knows reads
 * as deleted, so it is no longer followed.
 * @example
 * await refreshPending(input, [building]); // [{ tracked: building, readyState: 'READY', ready: …, wasPending: true }]
 */
export async function refreshPending(input: PollInput, pending: readonly TrackedDeployment[]): Promise<Observation[]> {
  const statuses = await Promise.all(pending.map((tracked) => fetchDeploymentStatus(input, tracked.id)));

  return pending.map((tracked, index) => {
    const status = statuses[index] ?? null;

    if (status === null) return { tracked, readyState: 'DELETED', wasPending: true };

    return { tracked, readyState: status.readyState, ready: status.ready, wasPending: true };
  });
}
