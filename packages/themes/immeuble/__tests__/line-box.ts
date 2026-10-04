import type { Rect } from '@deskorama/core';
import type { SignLine } from '../src/sign-line.ts';
import { textWidth } from '../src/text-width.ts';

/**
 * Returns the box a sign line's capitals take, in native pixels, accents left out.
 * @example
 * lineBox({ text: 'SUR', x: 3, y: 4, scale: 1, colour: '#000' }); // { x: 3, y: 4, w: 11, h: 5 }
 */
export function lineBox(line: SignLine): Rect {
  return { x: line.x, y: line.y, w: textWidth(line.text, line.scale), h: 5 * line.scale };
}
