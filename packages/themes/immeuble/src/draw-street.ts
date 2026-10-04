import { blit } from './blit.ts';
import { dither } from './dither.ts';
import { FURNITURE, LEGEND } from './furniture-sprites.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { sprite } from './sprite.ts';
import { toner } from './toner.ts';

const BOLLARDS = [8, 40, 132, 160, 196, 252, 328, 380] as const;
const BINS = [74, 288] as const;

/** The lamp posts stand off the signs: by the building's shops, or either side of the vacant lot's hoarding. */
const LAMPS = { building: [232, 318], next: [104, 392] } as const;

/**
 * Draws the street and what lies under it: the sidewalk, the cobbled road, bollards, recycling bins, cast-iron lamp
 * posts lit from dusk to dawn, and the vaulted cellar down to the bottom of the screen.
 * @example
 * drawStreet(ctx, layout, 'night');
 */
export function drawStreet(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode): void {
  const tone = toner(mode);
  const { W, streetY, sidewalkY, cellarY } = layout;

  paint(ctx, 0, streetY, W, sidewalkY - streetY + 2, tone('stone2'));
  for (let x = 0; x < W; x += 9) paint(ctx, x, streetY + 1, 1, sidewalkY - streetY + 1, tone('umber'));
  paint(ctx, 0, streetY, W, 1, PAL.ink);
  paint(ctx, 0, sidewalkY + 2, W, 1, PAL.ink);

  const road = sidewalkY + 3;
  paint(ctx, 0, road, W, cellarY - road, tone('zinc'));
  for (let y = road + 1; y < cellarY; y += 3) {
    for (let x = (y % 2) * 3; x < W; x += 6) paint(ctx, x, y, 4, 1, tone('slate'));
  }

  for (const x of BOLLARDS) paint(ctx, x, sidewalkY - 3, 2, 5, tone('wood'));
  for (const x of BINS) blit(ctx, sprite('bin', FURNITURE.BIN, LEGEND, tone, mode), x, sidewalkY - 5);
  for (const x of LAMPS[layout.side]) drawLampPost(ctx, layout, x, mode, tone);

  drawCellar(ctx, layout, tone);
}

/**
 * Draws one lamp post; its lantern glows and pools light on the sidewalk from dusk to dawn.
 * @example
 * drawLampPost(ctx, layout, 232, 'night', toner('night'));
 */
function drawLampPost(ctx: CanvasRenderingContext2D, layout: Layout, x: number, mode: LightMode, tone: Tone): void {
  const on = mode !== 'day';
  const top = layout.streetY - 26;
  const { sidewalkY } = layout;

  paint(ctx, x, top + 6, 2, sidewalkY + 2 - top - 6, PAL.ink);
  paint(ctx, x - 1, sidewalkY - 1, 4, 3, PAL.ink);
  paint(ctx, x - 2, top, 6, 7, PAL.ink);
  paint(ctx, x - 1, top + 1, 4, 4, on ? PAL.lamp : tone('haze'));
  paint(ctx, x - 1, top - 1, 4, 1, PAL.ink);

  if (!on) return;
  paint(ctx, x, top + 2, 2, 2, PAL.glow);
  dither(ctx, x - 4, top + 7, 10, 1, PAL.lamp, tone('stone'));
}

/**
 * Draws the cellar: dark stone, a row of vaults and the pipe run under its ceiling.
 * @example
 * drawCellar(ctx, layout, toner('day'));
 */
function drawCellar(ctx: CanvasRenderingContext2D, layout: Layout, tone: Tone): void {
  const { W, H, cellarY } = layout;

  paint(ctx, 0, cellarY, W, H - cellarY, PAL.ink);
  paint(ctx, 0, cellarY + 1, W, H - cellarY - 1, tone('umber'));

  for (let x = 0; x < W; x += 30) {
    for (let i = 0; i < 13; i += 1) {
      const lift = Math.round(Math.sin((i / 12) * Math.PI) * 5);
      paint(ctx, x + 2 + i * 2, cellarY + 8 - lift, 2, 1, tone('stone2'));
    }
    paint(ctx, x, cellarY + 3, 2, H - cellarY - 3, tone('stone2'));
  }

  paint(ctx, 0, cellarY + 2, W, 2, tone('slate'));
  paint(ctx, 0, cellarY + 2, W, 1, tone('zinc'));
  for (let x = 12; x < W; x += 24) paint(ctx, x, cellarY + 1, 2, 4, PAL.ink);
}
