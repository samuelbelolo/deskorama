/**
 * Draws a sprite at whole native coordinates, `scale` times its size, mirrored when `flip` is true.
 * @example
 * blit(ctx, sprite('heart', HEART, LEGEND), 40, 80);
 * blit(ctx, robot, 200, 160, { scale: 2, flip: true });
 */
export function blit(
  ctx: CanvasRenderingContext2D,
  art: HTMLCanvasElement,
  x: number,
  y: number,
  options: { readonly scale?: number; readonly flip?: boolean } = {},
): void {
  const scale = options.scale ?? 1;
  const left = Math.round(x);
  const top = Math.round(y);
  const w = art.width * scale;
  const h = art.height * scale;

  if (options.flip !== true) {
    ctx.drawImage(art, left, top, w, h);
    return;
  }

  ctx.save();
  ctx.translate(left + w, top);
  ctx.scale(-1, 1);
  ctx.drawImage(art, 0, 0, w, h);
  ctx.restore();
}
