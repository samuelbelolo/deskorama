import type { SourceEvent } from '@deskorama/core';
import type { TrackedDeployment } from './tracked-deployment.ts';

/**
 * Returns true when this poll stopped following the last production deploy whose start was told, without a success
 * or a failure to close it: canceled, blocked, deleted, or still unfinished after a day. Production is then idle
 * again, which the deploy steps alone cannot say.
 * @example
 * buildLeftOpen([productionBuilding], [], [canceledEvent]); // true
 * buildLeftOpen([productionBuilding], [], [succeededEvent]); // false
 */
export function buildLeftOpen(
  before: readonly TrackedDeployment[],
  after: readonly TrackedDeployment[],
  events: readonly SourceEvent[],
): boolean {
  const followed = before.some((tracked) => tracked.production);

  const stillFollowed = after.some((tracked) => tracked.production);

  const closed = events.some((event) => event.step === 'succeeded' || event.step === 'failed');

  return followed && !stillFollowed && !closed;
}
