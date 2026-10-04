import type { Rect } from '@deskorama/core';

/**
 * Returns true when two lists hold the same frames in the same order, so unchanged frames are not sent again.
 * @example
 * sameFrames([{ x: 0, y: 0, w: 10, h: 10 }], [{ x: 0, y: 0, w: 10, h: 10 }]); // true
 */
export function sameFrames(a: readonly Rect[], b: readonly Rect[]): boolean {
  return (
    a.length === b.length &&
    a.every((frame, index) => {
      const other = b[index];

      return (
        other !== undefined && frame.x === other.x && frame.y === other.y && frame.w === other.w && frame.h === other.h
      );
    })
  );
}
