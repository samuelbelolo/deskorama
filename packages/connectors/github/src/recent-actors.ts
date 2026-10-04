import type { Activity } from './activity.ts';

/** How long a contributor counts as active after doing something. */
const ACTIVE_FOR = 3_600_000;

/**
 * Returns when each contributor, by account id, last did something, keeping only the last hour: the size of the
 * result is the crowd Gauge.
 * @example
 * recentActors({ '5001': now - 600_000 }, [{ id: 5002, at: now - 60_000 }], now);
 * // { '5001': now - 600_000, '5002': now - 60_000 }
 */
export function recentActors(
  previous: Readonly<Record<string, number>>,
  activity: readonly Activity[],
  now: number,
): Record<string, number> {
  const actors: Record<string, number> = {};

  const note = (id: string, at: number): void => {
    if (at <= now - ACTIVE_FOR || at > now) return;

    actors[id] = Math.max(actors[id] ?? 0, at);
  };

  for (const [id, at] of Object.entries(previous)) note(id, at);

  for (const { id, at } of activity) note(String(id), at);

  return actors;
}
