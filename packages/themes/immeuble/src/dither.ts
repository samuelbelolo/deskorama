/**
 * Fills a rectangle with a two-colour checkerboard, the 16-bit way to blend two flat colours.
 * @example
 * dither(ctx, 0, 40, 360, 2, PAL.sky, PAL.haze);
 */
export function dither(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  a: string,
  b: string,
): void {
  ctx.fillStyle = a;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = b;
  for (let row = 0; row < h; row += 1) {
    for (let col = (row + x + y) % 2; col < w; col += 2) ctx.fillRect(x + col, y + row, 1, 1);
  }
}
