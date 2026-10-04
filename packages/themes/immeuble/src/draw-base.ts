import { drawBuilding } from './draw-building.ts';
import { drawCafe } from './draw-cafe.ts';
import { drawLot } from './draw-lot.ts';
import { drawNeighbour } from './draw-neighbour.ts';
import { drawNextBuilding } from './draw-next-building.ts';
import { drawRoom } from './draw-room.ts';
import { drawShops } from './draw-shops.ts';
import { drawSky } from './draw-sky.ts';
import { drawStreet } from './draw-street.ts';
import { drawTerrace } from './draw-terrace.ts';
import { isNightTv } from './is-night-tv.ts';
import type { Layout } from './layout.ts';
import { lightMode } from './light-mode.ts';
import type { Room } from './room.ts';
import type { SkyRow } from './sky-row.ts';

/** What the still layer shows: the rooms and who is home, the hour, and where the screen sits under the one sky. */
export interface BaseState {
  readonly rooms: readonly Room[];
  readonly lit: ReadonlySet<string>;
  readonly hour: number;
  readonly row: SkyRow;
}

/**
 * Draws the still layer of the scene for an hour: sky, the building and its rooms (lit where someone is home,
 * except in the deep night when only TVs glow), the neighbour's facade, the ground floor and the street. On the
 * next screen along the street: the next building, its café and terrace, and the vacant lot.
 * @example
 * drawBase(renderer.base, layout, { rooms, lit: residents.litIds(), hour: 14, row: { offset: 0, span: 360 } });
 */
export function drawBase(ctx: CanvasRenderingContext2D, layout: Layout, state: BaseState): void {
  const mode = lightMode(state.hour);
  const tv = isNightTv(state.hour);
  const building = layout.side === 'building';

  drawSky(ctx, layout, state.hour, state.row);
  if (building) drawBuilding(ctx, layout, mode);
  else drawNextBuilding(ctx, layout, mode);

  for (const room of state.rooms) drawRoom(ctx, room, { on: !tv && state.lit.has(room.id), mode, hour: state.hour });

  if (building) {
    drawNeighbour(ctx, layout, mode);
    drawShops(ctx, layout, mode, state.hour);
    drawStreet(ctx, layout, mode);
    return;
  }

  drawLot(ctx, layout, mode);
  drawCafe(ctx, layout, mode, state.hour);
  drawStreet(ctx, layout, mode);
  drawTerrace(ctx, layout, mode, state.hour);
}
