import type { FreeSpot, Point, Rect } from '@deskorama/core';
import { CAPTION_BOX, CAPTION_ROOM } from './caption-room.ts';
import { groundBand } from './ground-band.ts';
import type { Stage } from './stage.ts';

/** Where a Gag may look for room: a region of the screen, the ground under its actors' feet, or anywhere. */
type Band = Rect | 'ground' | 'anywhere';

/** What a Gag asks for: room for its actors, under the band its Caption hangs in. */
export interface RoomRequest {
  /** The actors' width; the room is never narrower than the widest Caption. */
  readonly w: number;
  /** The actors' height, from the top of the tallest one (or its speech bubble) down to their feet. */
  readonly h: number;
  /**
   * Where to look, in order: e.g. the ground only for people, the sky then the ground for a plane. `'ground'` is
   * wherever the actors' feet land on the apron, the runway or the grass.
   */
  readonly bands: readonly Band[];
  readonly near?: Point;
}

/** A held room: its Caption's band on top, the actors' stage under it, their feet on the floor. */
export interface Room {
  readonly spot: FreeSpot;
  /** The top of the actors' stage, under the Caption's band. */
  readonly top: number;
  /** The line the actors' feet (or wheels) stand on: the bottom of the room. */
  readonly floor: number;
}

/**
 * Returns a fully visible room for a Gag, held for `hold` ms so no other Gag lands on it, and off every sign:
 * inside the first band that has one, closest to `near`; null when no band has room.
 * @example
 * findRoom(stage, { w: 240, h: 90, bands: ['ground'], near: { x: 300, y: 740 } }, 7300);
 * // { spot: { x: 180, y: 512, w: 300, h: 230 }, top: 652, floor: 742 }
 */
export function findRoom(stage: Stage, request: RoomRequest, hold: number): Room | null {
  const w = Math.max(CAPTION_BOX.w, Math.ceil(request.w));
  const h = CAPTION_ROOM + Math.ceil(request.h);

  for (const band of request.bands) {
    const ask = { w, h, hold, within: within(stage, band, request.h) };
    const spot = stage.host.freeSpot(request.near === undefined ? ask : { ...ask, near: request.near });
    if (spot !== null) return { spot, top: spot.y + CAPTION_ROOM, floor: spot.y + spot.h };
  }

  return null;
}

/**
 * Returns the region a band stands for on this screen.
 * @example
 * within(stage, 'anywhere', 60); // { x: 0, y: 0, w: 1440, h: 900 }
 */
function within(stage: Stage, band: Band, height: number): Rect {
  const { layout } = stage;
  if (band === 'ground') return groundBand(layout, height);
  if (band === 'anywhere') return { x: 0, y: 0, w: layout.width, h: layout.height };

  return band;
}
