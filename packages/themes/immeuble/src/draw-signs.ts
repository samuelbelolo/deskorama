import type { GaugeValues, Rect } from '@deskorama/core';
import { boardLines } from './board-lines.ts';
import type { Copy } from './create-copy.ts';
import { drawSignLines } from './draw-sign-lines.ts';
import { hallLines } from './hall-lines.ts';
import type { Layout } from './layout.ts';
import { muralLines } from './mural-lines.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { posterLines } from './poster-lines.ts';
import { signFrames } from './sign-frames.ts';

/** What the signs show: the Gauges, today's intruders, and whether the kiosk is open. */
export interface SignState {
  readonly gauges: GaugeValues;
  readonly blocked: number;
  readonly kioskOpen: boolean;
}

/**
 * Draws the permanent signs over the scene. In the building: the agency's lit board, the kiosk's paper poster (dim
 * once the kiosk has closed) and the tally painted on the hall's wall. Next door: the LED panel on the hoarding and
 * the ad painted on the blind wall.
 * @example
 * drawSigns(ctx, copy, layout, { gauges, blocked: 2, kioskOpen: true });
 */
export function drawSigns(ctx: CanvasRenderingContext2D, copy: Copy, layout: Layout, state: SignState): void {
  const { board, poster } = signFrames(layout);
  paint(ctx, board.x, board.y, board.w, board.h, PAL.ink);
  paint(ctx, board.x + 1, board.y + 1, board.w - 2, board.h - 2, PAL.night);
  drawSignLines(ctx, boardLines(copy, state.gauges, board));

  if (layout.side === 'next') {
    drawMural(ctx, copy, state.gauges.total, poster);
    return;
  }

  const ink = state.kioskOpen ? PAL.ink : PAL.night;
  paint(ctx, poster.x - 1, poster.y - 1, poster.w + 2, poster.h + 2, ink);
  paint(ctx, poster.x, poster.y, poster.w, poster.h, state.kioskOpen ? PAL.paper : PAL.zinc);
  drawSignLines(ctx, posterLines(copy, state.gauges.total, poster, ink));

  drawSignLines(ctx, hallLines(copy, state.blocked, layout));
}

/**
 * Draws the ad painted on the blind wall: green paint in a limestone frame, and its lines.
 * @example
 * drawMural(ctx, copy, 37, { x: 249, y: 48, w: 128, h: 58 });
 */
function drawMural(ctx: CanvasRenderingContext2D, copy: Copy, total: number, frame: Rect): void {
  paint(ctx, frame.x - 1, frame.y - 1, frame.w + 2, frame.h + 2, PAL.stone2);
  paint(ctx, frame.x, frame.y, frame.w, frame.h, PAL.moss);
  drawSignLines(ctx, muralLines(copy, total, frame));
}
