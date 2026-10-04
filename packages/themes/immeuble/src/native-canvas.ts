/**
 * Returns a canvas of a native size and its context, smoothing off so every pixel stays hard.
 * @example
 * nativeCanvas(360, 225).canvas.width; // 360
 */
export function nativeCanvas(
  w: number,
  h: number,
): { readonly canvas: HTMLCanvasElement; readonly ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('This browser cannot draw on a canvas.');
  ctx.imageSmoothingEnabled = false;

  return { canvas, ctx };
}
