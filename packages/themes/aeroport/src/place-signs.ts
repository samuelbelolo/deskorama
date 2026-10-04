import type { Rect, VisibleRegions } from '@deskorama/core';

/**
 * Returns where the strip of signs stands: at home when every tile under it is visible, else on the visible spot
 * closest to home, else at home all the same (nothing of it shows then, and nothing else either). The strip's own
 * reservation must be released before calling, or it would stand in its own way.
 * @example
 * placeSigns(host, layout.signsHome); // { x: 24, y: 834, w: 434, h: 58 } when no window covers the bottom left
 */
export function placeSigns(regions: VisibleRegions, home: Rect): Rect {
  if (regions.visibleFraction(home) === 1) return home;
  const spot = regions.freeSpot({ w: home.w, h: home.h, near: { x: home.x + home.w / 2, y: home.y + home.h / 2 } });
  return spot === null ? home : { x: Math.round(spot.x), y: Math.round(spot.y), w: home.w, h: home.h };
}
