import { drawText } from './draw-text.ts';
import type { SignLine } from './sign-line.ts';

/**
 * Draws the lines of a sign where its layout placed them.
 * @example
 * drawSignLines(ctx, boardLines(copy, gauges, layout).lines);
 */
export function drawSignLines(ctx: CanvasRenderingContext2D, lines: readonly SignLine[]): void {
  for (const line of lines) drawText(ctx, line.text, line.x, line.y, line.colour, line.scale);
}
