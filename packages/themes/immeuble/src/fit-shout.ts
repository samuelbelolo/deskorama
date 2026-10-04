import type { Point, Rect, ScreenHost } from '@deskorama/core';
import { textWidth } from './text-width.ts';
import { toStage } from './to-stage.ts';

/** A shout fitted in visible space: its words, the native point its capitals are centred on, and its scale. */
export interface Shout {
  readonly text: string;
  readonly cx: number;
  readonly y: number;
  readonly scale: number;
  /** Its box with the outline and the accents, in native pixels. */
  readonly box: Rect;
}

/**
 * Fits a shout centred on a native point where it can be read: at `scale`, else at scale 1, wholly in visible space;
 * null when neither shows.
 * @example
 * fitShout(host, 'CRAC !', { x: 214, y: 20 }, 2); // { text: 'CRAC !', cx: 214, y: 20, scale: 2, box }
 */
export function fitShout(host: ScreenHost, text: string, at: Point, scale: number): Shout | null {
  for (const size of scale > 1 ? [scale, 1] : [1]) {
    const w = textWidth(text, size);
    const x = Math.round(at.x - w / 2);
    const box = { x: x - size, y: at.y - 3 * size, w: w + 2 * size, h: 9 * size };
    if (host.visibleFraction(toStage(box)) >= 0.99) return { text, cx: at.x, y: at.y, scale: size, box };
  }

  return null;
}
