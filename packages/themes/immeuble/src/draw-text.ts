import { textCells } from './text-cells.ts';

/**
 * Draws a text pixel by pixel at whole native coordinates, `y` at the top of the capitals, and returns the x after
 * its last glyph.
 * @example
 * drawText(ctx, 'EN LIGNE 5', 4, 170, PAL.lamp); // 41
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colour: string,
  scale = 1,
): number {
  const cells = textCells(text, x, y, scale);
  ctx.fillStyle = colour;

  for (const cell of cells.body) ctx.fillRect(cell.x, cell.y, scale, scale);
  for (const cell of cells.marks) ctx.fillRect(cell.x, cell.y, scale, scale);

  return cells.end;
}
