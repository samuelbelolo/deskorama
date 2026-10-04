import type { Screen } from '@deskorama/core';
import { sideOf, type Side } from './side-of.ts';

/** How many people each building houses: 29 rooms in the building, 12 next door. */
const CAPACITY: Readonly<Record<Side, number>> = { building: 29, next: 12 };

/**
 * Returns how many of the crowd live on one screen. The crowd is split across the connected screens in proportion
 * to their buildings' rooms, whole people only, the remainder handed out left to right; every screen computes the
 * same split on its own, so the shares always add up to the crowd.
 * @example
 * crowdShare(9, builtin, [builtin, external]); // 7
 * crowdShare(9, external, [builtin, external]); // 2
 */
export function crowdShare(crowd: number, own: Screen, screens: readonly Screen[]): number {
  const row = (screens.some((screen) => screen.id === own.id) ? screens : [...screens, own]).toSorted(
    (a, b) => a.x - b.x || a.y - b.y,
  );
  const rooms = row.map((screen) => CAPACITY[sideOf(screen)]);
  const all = rooms.reduce((sum, count) => sum + count, 0);
  const people = Math.max(0, Math.min(all, Math.round(crowd)));

  const shares = rooms.map((count) => Math.floor((people * count) / all));
  let left = people - shares.reduce((sum, share) => sum + share, 0);

  for (let i = 0; left > 0; i = (i + 1) % shares.length) {
    if ((shares[i] ?? 0) >= (rooms[i] ?? 0)) continue;
    shares[i] = (shares[i] ?? 0) + 1;
    left -= 1;
  }

  return shares[row.findIndex((screen) => screen.id === own.id)] ?? 0;
}
