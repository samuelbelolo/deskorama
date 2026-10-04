import type { Point } from '@deskorama/core';
import { lerp } from './lerp.ts';

/**
 * Returns the mobile stairs from the head of the queue up to the parked plane's front door, drawn in screen pixels.
 * @example
 * stairsMarkup({ x: 556, feetY: 738 }, { x: 629, y: 694 }).includes('stair-rail'); // true
 */
export function stairsMarkup(head: { readonly x: number; readonly feetY: number }, door: Point): string {
  const x0 = head.x + 10;
  const y0 = head.feetY;
  const x1 = door.x - 2;
  const y1 = door.y + 2;

  let steps = '';
  for (let i = 1; i < 7; i += 1) {
    steps += `<rect class="stair-step" x="${lerp(x0, x1, i / 7) - 4}" y="${lerp(y0, y1, i / 7)}" width="8" height="1.6"/>`;
  }

  return `<svg width="${x1 + 20}" height="${y0 + 4}" viewBox="0 0 ${x1 + 20} ${y0 + 4}">
    <path class="stair-side" d="M${x0},${y0} L${x1},${y1} L${x1 + 6},${y1} L${x1 + 6},${y0} Z"/>
    ${steps}
    <path class="stair-rail" d="M${x0 + 2},${y0 - 14} L${x1 - 2},${y1 - 14}"/>
    <rect class="stair-base" x="${x0 - 6}" y="${y0 - 4}" width="${x1 - x0 + 16}" height="4"/>
  </svg>`;
}
