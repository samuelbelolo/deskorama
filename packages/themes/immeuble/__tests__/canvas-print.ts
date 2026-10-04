import type { Rect } from '@deskorama/core';

/**
 * Returns a fingerprint of what the building's canvas shows right now, all of it or a native region of it: two equal
 * prints mean the same picture.
 * @example
 * canvasPrint(layer) === canvasPrint(layer); // true while nothing moves
 * canvasPrint(layer, { x: 150, y: 0, w: 210, h: 60 }); // the roof and the crane only
 */
export function canvasPrint(layer: HTMLElement, region?: Rect): string {
  const canvas = layer.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (canvas === null || ctx === null || ctx === undefined) throw new Error('The building has no canvas.');

  const { x, y, w, h } = region ?? { x: 0, y: 0, w: canvas.width, h: canvas.height };
  const { data } = ctx.getImageData(x, y, w, h);
  let hash = 0;
  for (let i = 0; i < data.length; i += 1) hash = (Math.imul(hash, 31) + (data[i] ?? 0)) | 0;

  return `${canvas.style.transform}|${hash}`;
}
