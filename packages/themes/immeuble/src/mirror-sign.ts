import type { Cancel, Rect } from '@deskorama/core';
import type { Mirror } from './create-mirror.ts';

/**
 * Mirrors what one permanent sign reads over its box, as `data-part="sign"` with its name; returns what removes it.
 * @example
 * mirrorSign(mirror, 'board', homes.board, 'SUR TRAMLO ACTIFS 9 COMMITS 23');
 */
export function mirrorSign(mirror: Mirror, sign: string, box: Rect, words: string): Cancel {
  return mirror.set(`sign-${sign}`, { box, data: { part: 'sign', sign }, parts: [['sign-text', words]] });
}
