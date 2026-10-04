import type { TrackedDeployment } from './tracked-deployment.ts';

/** How many unfinished deployments one poll reads again by id; the others wait their turn. */
const MAX_REFRESHED = 10;

/** Which unfinished deployments a poll reads again, and which wait for a later poll. */
export interface PendingTurn {
  readonly refresh: readonly TrackedDeployment[];
  readonly carry: readonly TrackedDeployment[];
}

/**
 * Splits the followed deployments for one poll: those listed again are left to the list, the first ten in line are
 * read again by id, and the others wait at the head of the line, so every one gets its turn.
 * @example
 * followPending([a, b], new Set(['a'])); // { refresh: [b], carry: [] }
 */
export function followPending(pending: readonly TrackedDeployment[], listedIds: ReadonlySet<string>): PendingTurn {
  const waiting = pending.filter((tracked) => !listedIds.has(tracked.id));

  return { refresh: waiting.slice(0, MAX_REFRESHED), carry: waiting.slice(MAX_REFRESHED) };
}
