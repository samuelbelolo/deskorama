import { blit } from './blit.ts';
import { dimToner } from './dim-toner.ts';
import { FURNITURE, LEGEND } from './furniture-sprites.ts';
import { BAY } from './grid.ts';
import { isOpen } from './is-open.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { LIT } from './lit.ts';
import { NEXT_BAYS } from './lot-geometry.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { sprite } from './sprite.ts';

/** The café's width in native pixels: the whole ground floor of the next building. */
const CAFE_W = NEXT_BAYS * BAY;

/** Where the stools stand along the counter and the windows. */
const STOOLS = [8, 172, 196] as const;

/**
 * Draws the corner café on the next building's ground floor: a striped awning, a zinc counter with its coffee
 * machine, a shelf of bottles and the stools; lit while it is open, dim once it has closed.
 * @example
 * drawCafe(ctx, layout, 'day', 14);
 */
export function drawCafe(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode, hour: number): void {
  const open = isOpen('cafe', hour);
  const tone = open ? LIT : dimToner(mode);
  const top = layout.rdcY;
  const floor = top + 27;

  paint(ctx, 1, top + 1, CAFE_W - 2, 26, open ? PAL.litwall : tone('stone2'));
  for (let x = 1; x < CAFE_W - 1; x += 6) paint(ctx, x, top + 1, 3, 4, tone(x % 12 < 6 ? 'moss' : 'paper'));
  paint(ctx, 1, top + 5, CAFE_W - 2, 1, PAL.ink);

  paint(ctx, 40, floor - 10, 120, 2, tone('zinc'));
  paint(ctx, 41, floor - 8, 118, 7, tone('wood'));
  for (let x = 46; x < 156; x += 12) paint(ctx, x, floor - 8, 1, 7, tone('umber'));

  const machine = FURNITURE.COFFEE_MACHINE;
  blit(ctx, sprite('COFFEE_MACHINE', machine, LEGEND, tone, open ? 'day' : `dim-${mode}`), 60, floor - 14);

  for (let i = 0; i < 9; i += 1) paint(ctx, 96 + i * 5, top + 9 + (i % 2), 2, 5, tone(i % 3 === 0 ? 'dawn' : 'moss'));
  paint(ctx, 94, top + 15, 48, 1, tone('wood'));
  for (const x of STOOLS) drawStool(ctx, x, floor, tone);
}

/**
 * Draws a bar stool standing on the café's floor.
 * @example
 * drawStool(ctx, 172, 192, LIT);
 */
function drawStool(ctx: CanvasRenderingContext2D, x: number, floor: number, tone: Tone): void {
  paint(ctx, x, floor - 6, 5, 1, tone('wood'));
  paint(ctx, x + 1, floor - 5, 1, 4, PAL.ink);
  paint(ctx, x + 3, floor - 5, 1, 4, PAL.ink);
}
