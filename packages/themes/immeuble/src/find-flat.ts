import type { FreeSpot, WallpaperEvent } from '@deskorama/core';
import type { GagEnv } from './gag.ts';
import type { Plaque } from './plaque.ts';
import type { Room } from './room.ts';
import { say } from './say.ts';
import { gagSpan } from './timing.ts';
import { toNative } from './to-native.ts';

/** A held flat for a Gag, and its held plaque. */
export interface FlatStage {
  readonly room: Room;
  readonly spot: FreeSpot;
  readonly plaque: Plaque;
}

/**
 * Finds a fully visible, empty flat whose plaque fits beside it and holds both; a lit flat only when no empty one
 * will do. The flats are tried in a seeded order, so the same seed picks the same flat.
 * @example
 * findFlat(env, event, 3000); // { room, spot, plaque } or null
 */
export function findFlat(env: GagEnv, event: WallpaperEvent, duration: number): FlatStage | null {
  const order = env
    .flats()
    .map(({ room, lit }) => ({ room, key: (lit ? 1 : 0) + env.host.random.next() * 0.5 }))
    .toSorted((a, b) => a.key - b.key);

  for (const { room } of order) {
    if (env.place.exact(room.stage, 0) === null) continue;

    const plaque = say(env, event, toNative(room.stage), duration, { avoid: [room.stage] });
    if (plaque === null) continue;

    const spot = env.place.exact(room.stage, gagSpan(duration));
    if (spot !== null) return { room, spot, plaque };
    plaque.spot.release();
  }

  return null;
}
