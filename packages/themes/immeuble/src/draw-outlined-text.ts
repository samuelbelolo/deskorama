import { drawText } from './draw-text.ts';
import { PAL } from './palette.ts';
import { textWidth } from './text-width.ts';

/** The eight neighbours a solid outline is drawn at. */
const AROUND = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
] as const;

/**
 * Draws a short text centred on `cx` with a solid ink outline, kept inside the canvas, so nothing under it (a lamp
 * post, a window frame) cuts through its letters.
 * @example
 * drawOutlinedText(ctx, '+49 €', 180, 30, PAL.glow);
 */
export function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  colour: string,
  scale = 1,
): void {
  const w = textWidth(text, scale);
  const x = Math.max(scale + 1, Math.min(ctx.canvas.width - w - scale - 1, Math.round(cx - w / 2)));

  for (const [dx, dy] of AROUND) drawText(ctx, text, x + dx * scale, y + dy * scale, PAL.ink, scale);
  drawText(ctx, text, x, y, colour, scale);
}
