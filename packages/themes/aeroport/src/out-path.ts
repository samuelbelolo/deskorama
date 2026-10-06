import { clearHeight, type Point, type Screen, type VisibleRegions } from '@deskorama/core';
import { PLANE, STEEPEST_CLIMB, TIMING, type GearPose } from './flight-geometry.ts';
import { climbOut } from './climb-out.ts';
import { pitchOf } from './pitch-of.ts';
import type { Layout } from './layout.ts';
import { lerp } from './lerp.ts';

/** The patch of sky the plane heads for once it is over this screen. */
const SKY_PATCH = { w: 600, h: 220 } as const;

/** The PROD flight over an airfield screen, and how long it takes after the hand-off to leave the screen. */
export interface OutPath {
  readonly at: (t: number) => GearPose;
  readonly beyond: number;
}

/**
 * Returns the PROD flight as an airfield screen sees it, `t` ms after the terminal's fixed last stretch starts:
 * first that same stretch, offset by where the terminal stands, so the plane enters at the left edge where it left
 * the terminal; then a straight line toward the free sky over this screen, and on until the whole plane has left it,
 * however wide the screen.
 * @example
 * const path = outPath(host, layoutFor(host.screen), { own: external, terminal: builtin });
 * path.at(0); // { x: -300, y: 724, r: about -13 }: still over the terminal, left of this screen
 */
export function outPath(regions: VisibleRegions, layout: Layout, from: { own: Screen; terminal: Screen }): OutPath {
  const { own, terminal } = from;
  const dx = terminal.x - own.x;
  const dy = terminal.y - own.y;
  const climb = climbOut(terminal.width, clearHeight(terminal));
  const a = { x: climb.a.x + dx, y: climb.a.y + dy };
  const b = { x: climb.b.x + dx, y: climb.b.y + dy };

  const target = skyTarget(regions, layout);
  const speed = Math.hypot(b.x - a.x, b.y - a.y) / TIMING.handoff;
  const length = Math.hypot(target.x - b.x, target.y - b.y) || 1;
  const heading = { x: (target.x - b.x) / length, y: (target.y - b.y) / length };
  const pitchIn = pitchOf(a, b);
  const pitchOut = Math.max(-STEEPEST_CLIMB, Math.min(0, pitchOf(b, { x: b.x + heading.x, y: b.y + heading.y })));

  const at = (t: number): GearPose => {
    if (t <= TIMING.handoff) {
      const u = t / TIMING.handoff;

      return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: pitchIn };
    }

    const s = (t - TIMING.handoff) * speed;

    return { x: b.x + heading.x * s, y: b.y + heading.y * s, r: lerp(pitchIn, pitchOut, Math.min(1, s / 200)) };
  };

  return { at, beyond: Math.max(TIMING.beyond, exitDistance(b, heading, layout.width) / speed) };
}

/**
 * Returns how far the plane travels from `b` along `heading` before the whole of it has left the screen, by the
 * right edge or the top; the default crossing when it never would.
 * @example
 * exitDistance({ x: 230, y: 600 }, { x: 1, y: 0 }, 1600); // 1595: the gear past x 1825, the tail past 1600
 */
function exitDistance(b: Point, heading: Point, width: number): number {
  const right = heading.x > 0 ? (width + PLANE.gear.x - b.x) / heading.x : Infinity;
  const top = heading.y < 0 ? (b.y - (PLANE.gear.y - PLANE.h)) / -heading.y : Infinity;
  const distance = Math.min(right, top);

  return Number.isFinite(distance) ? distance : 0;
}

/**
 * Returns where the plane heads once over this screen: a free patch of sky under the board, else the middle of the
 * screen. The patch is not held: the plane only passes through.
 * @example
 * skyTarget(host, layoutFor(external)); // { x: 1280, y: 610 } with the sky clear
 */
function skyTarget(regions: VisibleRegions, layout: Layout): Point {
  const near = { x: layout.width - 320, y: layout.horizon - 120 };
  const spot = regions.freeSpot({ ...SKY_PATCH, within: layout.skyBand, near });
  if (spot === null) return { x: layout.width * 0.7, y: layout.height * 0.5 };

  return { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 + 80 };
}
