/**
 * Returns the colour the building's canvas shows at a native pixel, as "#rrggbb".
 * @example
 * pixelAt(layer, 10, 5); // "#9cc3dc", the afternoon sky
 */
export function pixelAt(layer: HTMLElement, x: number, y: number): string {
  const ctx = layer.querySelector('canvas')?.getContext('2d');
  if (ctx === null || ctx === undefined) throw new Error('The building has no canvas.');

  const [r = 0, g = 0, b = 0] = ctx.getImageData(x, y, 1, 1).data;

  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}
