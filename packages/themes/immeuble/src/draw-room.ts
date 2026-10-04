import { blit } from './blit.ts';
import { dither } from './dither.ts';
import { FURNITURE, LEGEND, type FurnitureName } from './furniture-sprites.ts';
import type { LightMode } from './light-mode.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { roomColours } from './room-colours.ts';
import type { Room } from './room.ts';
import { skyBands } from './sky-bands.ts';
import { sprite } from './sprite.ts';
import { windowRect } from './window-rect.ts';

/** A piece of furniture: its pixel map, its x in the room, and its y when it hangs on the wall. */
type Piece = readonly [name: FurnitureName, dx: number, dy?: number];

/** The furniture sets of the flats, picked by each room's seed. */
const FLAT_SETS: readonly (readonly Piece[])[] = [
  [
    ['BED', 2],
    ['PLANT', 38],
    ['FRAME', 32, 8],
  ],
  [
    ['SOFA', 2],
    ['TV_OFF', 34],
  ],
  [
    ['TABLE', 3],
    ['SHELF', 36],
  ],
  [
    ['DESK', 3],
    ['BED', 30],
  ],
  [
    ['FRIDGE', 2],
    ['TABLE', 33],
  ],
  [
    ['SHELF', 2],
    ['SOFA', 31],
  ],
  [
    ['BED', 30],
    ['FLOOR_LAMP', 3],
    ['FRAME', 8, 8],
  ],
];

/** The furniture sets of the mansard rooms. */
const ATTIC_SETS: readonly (readonly Piece[])[] = [
  [
    ['BED', 2],
    ['PLANT', 37],
  ],
  [
    ['PLANT', 3],
    ['BED', 29],
  ],
  [['BED', 29]],
];

/**
 * Draws one room: its wall and floor, its window on the sky of the hour (net curtains drawn in an empty flat by
 * day), its furniture, and its ceiling lamp when someone is home.
 * @example
 * drawRoom(ctx, rooms[0], { on: true, mode: 'night', hour: 23 });
 */
export function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  state: { readonly on: boolean; readonly mode: LightMode; readonly hour: number },
): void {
  const colours = roomColours(state.on, state.mode);
  const left = room.x + 1;
  const top = room.y + 1;

  paint(ctx, left, top, room.w - 2, room.floorY - top, colours.wall);
  paint(ctx, left, top, room.w - 2, 1, colours.shade);
  paint(ctx, left, room.floorY - 1, room.w - 2, 1, colours.floor);

  if (room.rows === 2) drawWindow(ctx, room, state.hour, colours.tone, !state.on && state.mode === 'day');
  else drawSkylight(ctx, room, state.hour, colours.tone);

  const sets = room.rows === 2 ? FLAT_SETS : ATTIC_SETS;
  for (const [name, dx, dy] of sets[room.seed % sets.length] ?? []) {
    const art = sprite(name, FURNITURE[name], LEGEND, colours.tone, colours.toneName);
    const y = dy === undefined ? room.floorY - 1 - art.height : room.y + dy;
    blit(ctx, art, room.x + dx, y);
  }

  if (state.on) drawCeilingLamp(ctx, room);
}

/**
 * Draws the courtyard window: the sky of the hour in its glass, a stone frame, green shutters folded open.
 * @example
 * drawWindow(ctx, room, 14, LIT, true);
 */
function drawWindow(ctx: CanvasRenderingContext2D, room: Room, hour: number, tone: Tone, curtains: boolean): void {
  const { x, y, w, h } = windowRect(room);

  paint(ctx, x - 1, y - 1, w + 2, h + 2, tone('stone'));
  paint(ctx, x, y, w, h, PAL[skyBands(hour)[1]]);
  paint(ctx, x + Math.floor(w / 2), y, 1, h, tone('stone'));
  paint(ctx, x, y + 5, w, 1, tone('stone'));
  if (curtains) dither(ctx, x, y + 1, w, h - 1, PAL.haze, PAL.paper);

  for (const side of [x - 4, x + w + 1]) {
    paint(ctx, side, y - 1, 3, h + 2, tone('moss'));
    for (let row = y + 1; row < y + h; row += 2) paint(ctx, side, row, 3, 1, tone('leaf'));
  }

  paint(ctx, x - 2, y + h + 1, w + 4, 1, tone('stone2'));
}

/**
 * Draws the small roof window of a mansard room.
 * @example
 * drawSkylight(ctx, room, 3, LIT);
 */
function drawSkylight(ctx: CanvasRenderingContext2D, room: Room, hour: number, tone: Tone): void {
  const cx = room.x + Math.floor(room.w / 2);

  paint(ctx, cx - 4, room.y + 2, 7, 5, tone('stone'));
  paint(ctx, cx - 3, room.y + 3, 5, 3, PAL[skyBands(hour)[0]]);
}

/**
 * Draws a ceiling lamp and the dithered pool of light under it.
 * @example
 * drawCeilingLamp(ctx, room);
 */
function drawCeilingLamp(ctx: CanvasRenderingContext2D, room: Room): void {
  const cx = room.x + 10;

  paint(ctx, cx, room.y + 1, 1, 2, PAL.ink);
  paint(ctx, cx - 1, room.y + 3, 3, 1, PAL.lamp);
  dither(ctx, cx - 2, room.y + 4, 5, 1, PAL.litwall, PAL.glow);
}
