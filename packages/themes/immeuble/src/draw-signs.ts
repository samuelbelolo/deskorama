import type { GaugeValues } from '@deskorama/core';
import { boardLines } from './board-lines.ts';
import type { Copy } from './create-copy.ts';
import { drawSignLines } from './draw-sign-lines.ts';
import { hallLines } from './hall-lines.ts';
import type { Layout } from './layout.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { posterLines } from './poster-lines.ts';
import { signFrames } from './sign-frames.ts';

/** What the ground floor's signs show: the Gauges, today's intruders, and whether the kiosk is open. */
export interface SignState {
  readonly gauges: GaugeValues;
  readonly blocked: number;
  readonly kioskOpen: boolean;
}

/**
 * Draws the ground floor's signs over the scene: the agency's lit board, the kiosk's paper poster (dim once the
 * kiosk has closed) and the tally painted on the hall's wall.
 * @example
 * drawSigns(ctx, copy, layout, { gauges, blocked: 2, kioskOpen: true });
 */
export function drawSigns(ctx: CanvasRenderingContext2D, copy: Copy, layout: Layout, state: SignState): void {
  const { board, poster } = signFrames(layout);
  paint(ctx, board.x, board.y, board.w, board.h, PAL.ink);
  paint(ctx, board.x + 1, board.y + 1, board.w - 2, board.h - 2, PAL.night);
  drawSignLines(ctx, boardLines(copy, state.gauges, board));

  const ink = state.kioskOpen ? PAL.ink : PAL.night;
  paint(ctx, poster.x - 1, poster.y - 1, poster.w + 2, poster.h + 2, ink);
  paint(ctx, poster.x, poster.y, poster.w, poster.h, state.kioskOpen ? PAL.paper : PAL.zinc);
  drawSignLines(ctx, posterLines(copy, state.gauges.total, poster, ink));

  drawSignLines(ctx, hallLines(copy, state.blocked, layout));
}
