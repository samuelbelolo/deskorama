import type { ListedDeployment } from './deployment-list.ts';
import type { Observation } from './observation.ts';
import { toTracked } from './to-tracked.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/**
 * Returns a listed deployment as this poll saw it, noting whether an earlier poll already followed it.
 * @example
 * observeListed({ uid: 'dpl_7Hq2', readyState: 'BUILDING', … }, []); // { …, readyState: 'BUILDING', wasPending: false }
 */
export function observeListed(deployment: ListedDeployment, pending: readonly TrackedDeployment[]): Observation {
  return {
    tracked: toTracked(deployment),
    readyState: deployment.readyState,
    ready: deployment.ready,
    wasPending: pending.some((tracked) => tracked.id === deployment.uid),
  };
}
