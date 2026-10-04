import type { Point, VisibleRegions } from '@deskorama/core';
import { PLANE } from './flight-geometry.ts';
import type { Layout } from './layout.ts';

/**
 * Returns the share of the PROD Caravelle's fuselage visible on this screen with its main gear at `gear`, from 0 to
 * 1: off the screen counts as hidden.
 * @example
 * planeVisible(host, layoutFor(host.screen), { x: 255, y: 814 }); // 1 at the threshold with no window
 */
export function planeVisible(regions: VisibleRegions, layout: Layout, gear: Point): number {
  const box = {
    x: gear.x - PLANE.gear.x,
    y: gear.y - PLANE.gear.y + 30 * PLANE.scale,
    w: PLANE.w,
    h: 30 * PLANE.scale,
  };

  const left = Math.max(0, box.x);
  const top = Math.max(0, box.y);
  const right = Math.min(layout.width, box.x + box.w);
  const bottom = Math.min(layout.height, box.y + box.h);
  if (right <= left || bottom <= top) return 0;

  const inside = { x: left, y: top, w: right - left, h: bottom - top };

  return regions.visibleFraction(inside) * ((inside.w * inside.h) / (box.w * box.h));
}
