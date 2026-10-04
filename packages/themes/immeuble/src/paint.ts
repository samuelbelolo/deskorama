/**
 * Fills a rectangle with one colour at whole native coordinates.
 * @example
 * paint(ctx, 0, 195, 360, 1, PAL.ink);
 */
export function paint(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
