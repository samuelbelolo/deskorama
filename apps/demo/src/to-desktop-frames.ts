import type { Rect, Screen } from '@deskorama/core';

/**
 * Returns frames given in one screen's pixels in desktop coordinates, the ones the Host reports to the engine, cut
 * to the screen: the part of a window dragged past the edge is not drawn, so it covers no neighbouring screen.
 * @example
 * toDesktopFrames(EXTERNAL_SCREEN, [{ x: 60, y: 70, w: 760, h: 520 }]); // [{ x: 1500, y: 70, w: 760, h: 520 }]
 * toDesktopFrames(BUILTIN_SCREEN, [{ x: 1360, y: 60, w: 620, h: 400 }]); // [{ x: 1360, y: 60, w: 80, h: 400 }]
 */
export function toDesktopFrames(screen: Screen, frames: readonly Rect[]): Rect[] {
  return frames.flatMap((frame) => {
    const left = Math.max(0, frame.x);
    const top = Math.max(0, frame.y);
    const right = Math.min(screen.width, frame.x + frame.w);
    const bottom = Math.min(screen.height, frame.y + frame.h);

    if (right <= left || bottom <= top) return [];
    return [{ x: left + screen.x, y: top + screen.y, w: right - left, h: bottom - top }];
  });
}
