import { dither } from './dither.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { Room } from './room.ts';

/** The party: every empty room lights up this long. */
const PARTY_MS = 3000;

/** The blackout: every lit room goes dark this long, then the floors relight one by one from the ground up. */
const DARK_MS = 600;
const FLOOR_MS = 260;

/** The building's lights as one: the party of a big moment, the blackout of a collapse. */
export interface Lights {
  /** Lights every empty room for three seconds, from a Clock time. */
  party(now: number): void;
  /** Puts out every lit room at a Clock time; they relight floor by floor. */
  blackout(now: number): void;
  /** Draws the party or the blackout over the rooms at a Clock time; `still` holds one colour, no blinking. */
  draw(ctx: CanvasRenderingContext2D, lit: ReadonlySet<string>, now: number, still: boolean): void;
  /** True while the party or the blackout shows. */
  busy(now: number): boolean;
}

/**
 * Returns the lights of one screen's building, so even a thin visible strip of facade shows that something big
 * happened: the whole building lights up for a big moment, and blacks out when the site collapses.
 * @example
 * const lights = createLights(rooms);
 * lights.blackout(clock.now());
 */
export function createLights(rooms: readonly Room[]): Lights {
  const floors = [...new Set(rooms.map((room) => room.row))].toSorted((a, b) => b - a);
  const lastRelit = DARK_MS + floors.length * FLOOR_MS;
  let partyAt = Number.NEGATIVE_INFINITY;
  let darkAt = Number.NEGATIVE_INFINITY;

  return {
    party(now) {
      partyAt = now;
    },
    blackout(now) {
      darkAt = now;
    },
    draw(ctx, lit, now, still) {
      if (now - partyAt < PARTY_MS) drawParty(ctx, rooms, lit, still ? 0 : now - partyAt);
      // Held still, the building stays dark until every floor would be back, then relights at once.
      if (now - darkAt < lastRelit) drawDark(ctx, rooms, lit, { floors, elapsed: still ? 0 : now - darkAt });
    },
    busy: (now) => now - partyAt < PARTY_MS || now - darkAt < lastRelit,
  };
}

/**
 * Lights every empty room, blinking between lamp light and its glow every 300 ms.
 * @example
 * drawParty(ctx, rooms, lit, 1200);
 */
function drawParty(ctx: CanvasRenderingContext2D, rooms: readonly Room[], lit: ReadonlySet<string>, t: number): void {
  const colour = Math.floor(t / 300) % 2 === 1 ? PAL.glow : PAL.litwall;

  for (const room of rooms) {
    if (lit.has(room.id)) continue;
    paint(ctx, room.x + 1, room.y + 1, room.w - 2, room.floorY - room.y - 2, colour);
    paint(ctx, room.x + 10, room.y + 3, 3, 1, PAL.lamp);
  }
}

/**
 * Darkens the lit rooms that have not relit yet, each floor flickering back on its turn.
 * @example
 * drawDark(ctx, rooms, lit, { floors: [9, 7, 5, 4], elapsed: 700 }); // the first floor relit, the others dark
 */
function drawDark(
  ctx: CanvasRenderingContext2D,
  rooms: readonly Room[],
  lit: ReadonlySet<string>,
  at: { readonly floors: readonly number[]; readonly elapsed: number },
): void {
  for (const room of rooms) {
    if (!lit.has(room.id)) continue;

    const relitAt = DARK_MS + at.floors.indexOf(room.row) * FLOOR_MS;
    if (at.elapsed >= relitAt) continue;

    const h = room.floorY - room.y - 1;
    if (at.elapsed > relitAt - 120) dither(ctx, room.x + 1, room.y + 1, room.w - 2, h, PAL.night, PAL.litwall);
    else paint(ctx, room.x + 1, room.y + 1, room.w - 2, h, PAL.night);
  }
}
