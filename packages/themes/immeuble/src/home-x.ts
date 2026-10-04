import type { ScreenHost } from '@deskorama/core';
import { bayStage } from './bay-stage.ts';
import type { Room } from './room.ts';

/**
 * Returns where a tenant stands: the middle of their room's most visible bay, so they are seen through a sliver.
 * @example
 * homeX(host, rooms[0]); // room.x + 5 when only the left bay shows
 */
export function homeX(host: ScreenHost, room: Room): number {
  let best = Math.floor(room.bays / 2);
  let bestScore = -1;

  for (let bay = 0; bay < room.bays; bay += 1) {
    const score = host.visibleFraction(bayStage(room, bay));
    if (score > bestScore + 0.01) [best, bestScore] = [bay, score];
  }

  return room.x + best * 15 + 5;
}
