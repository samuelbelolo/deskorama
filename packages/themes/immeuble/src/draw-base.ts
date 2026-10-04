import { drawBuilding } from './draw-building.ts';
import { drawNeighbour } from './draw-neighbour.ts';
import { drawRoom } from './draw-room.ts';
import { drawShops } from './draw-shops.ts';
import { drawSky } from './draw-sky.ts';
import { drawStreet } from './draw-street.ts';
import { isNightTv } from './is-night-tv.ts';
import type { Layout } from './layout.ts';
import { lightMode } from './light-mode.ts';
import type { Room } from './room.ts';

/**
 * Draws the still layer of the scene for an hour: sky, the building and its rooms (lit where someone is home,
 * except in the deep night when only TVs glow), the neighbour's facade, the ground floor and the street.
 * @example
 * drawBase(renderer.base, layout, { rooms, lit: residents.litIds(), hour: 14 });
 */
export function drawBase(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  state: { readonly rooms: readonly Room[]; readonly lit: ReadonlySet<string>; readonly hour: number },
): void {
  const mode = lightMode(state.hour);
  const tv = isNightTv(state.hour);

  drawSky(ctx, layout, state.hour);
  drawBuilding(ctx, layout, mode);
  for (const room of state.rooms) drawRoom(ctx, room, { on: !tv && state.lit.has(room.id), mode, hour: state.hour });
  drawNeighbour(ctx, layout, mode);
  drawShops(ctx, layout, mode, state.hour);
  drawStreet(ctx, layout, mode);
}
