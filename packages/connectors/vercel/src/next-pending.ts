import { isUnfinished } from './is-unfinished.ts';
import type { Observation } from './observation.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/** After this long, a deployment read again and still unfinished is no longer followed: no build takes a day. */
const MAX_PENDING_AGE_MS = 24 * 60 * 60_000;

/**
 * Returns the deployments to follow on the next poll, in line: first those this poll had no turn to read, then those
 * it saw still unfinished. A deployment is dropped only once read and still unfinished after a day.
 * @example
 * nextPending([waiting], [{ tracked: building, readyState: 'BUILDING', wasPending: false }], now); // [waiting, building]
 * nextPending([], [{ tracked: building, readyState: 'READY', wasPending: true }], now); // []
 */
export function nextPending(
  carry: readonly TrackedDeployment[],
  observations: readonly Observation[],
  now: number,
): TrackedDeployment[] {
  const unfinished = observations
    .filter((observation) => isUnfinished(observation.readyState))
    .map((observation) => observation.tracked)
    .filter((tracked) => now - tracked.created < MAX_PENDING_AGE_MS);

  return [...carry, ...unfinished];
}
