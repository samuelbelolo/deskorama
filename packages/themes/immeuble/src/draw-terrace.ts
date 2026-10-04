import { isOpen } from './is-open.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { LIT } from './lit.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { toner } from './toner.ts';

/** Where the terrace tables stand on the sidewalk in front of the café. */
const TABLES = [24, 84, 144, 204] as const;

/**
 * Draws the café's terrace on the sidewalk while the café is open: round tables, each with two chairs. Drawn after
 * the street, so the tables stand on it.
 * @example
 * drawTerrace(ctx, layout, 'day', 14);
 */
export function drawTerrace(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode, hour: number): void {
  if (!isOpen('cafe', hour)) return;

  const tone = mode === 'day' ? LIT : toner('twilight');
  for (const x of TABLES) drawTable(ctx, x, layout.streetY + 4, tone);
}

/**
 * Draws one round table and its two chairs, standing on a line.
 * @example
 * drawTable(ctx, 24, 199, LIT);
 */
function drawTable(ctx: CanvasRenderingContext2D, x: number, y: number, tone: Tone): void {
  paint(ctx, x, y - 4, 7, 1, tone('zinc'));
  paint(ctx, x + 3, y - 3, 1, 4, PAL.ink);
  paint(ctx, x + 1, y, 5, 1, PAL.ink);

  for (const dx of [-4, 9]) {
    paint(ctx, x + dx, y - 6, 1, 4, tone('wood'));
    paint(ctx, x + dx, y - 3, 3, 1, tone('wood'));
    paint(ctx, x + dx, y - 2, 1, 3, PAL.ink);
    paint(ctx, x + dx + 2, y - 2, 1, 3, PAL.ink);
  }
}
