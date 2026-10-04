import type { Cancel } from '@deskorama/core';
import type { DeployPlane } from './create-deploy-plane.ts';
import { createSceneSprite } from './create-scene-sprite.ts';
import { EASE } from './ease.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import type { Wreck } from './play-jackpot.ts';
import { poseSprite } from './pose-sprite.ts';
import { runTimeline } from './run-timeline.ts';
import type { Stage } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';
import { TOW_TUG, towTugMarkup } from './tow-tug-markup.ts';

/** How long the runway takes to clear: the tug comes, hooks on, and hauls the plane away. */
const TOW_MS = 4500;

/** The tug's size on screen. */
const TUG_SCALE = 1.5;

/**
 * Clears the runway after a failed deploy: the tow tractor drives in from the left edge and hauls the foamed
 * Caravelle off backwards, while the fire truck drives off to the right. Calls `done` once the runway is clear, the
 * plane and the truck gone; returns what stops it early.
 * @example
 * const stop = towAway(stage, plane, wreck, () => lineUp(next, host, layout));
 */
export function towAway(stage: Stage, plane: DeployPlane, wreck: Wreck, done: () => void): Cancel {
  const { host, layout } = stage;
  const start = plane.pose();
  const hull = plane.box();
  const truckFrom = wreck.truck.x();
  const truckFeet = layout.taxiwayTop + 14;

  const tug = createSceneSprite(wreck.layer, svgMarkup(towTugMarkup(TUG_SCALE)), 'tow-tug');
  const tugW = TOW_TUG.w * TUG_SCALE;
  const tugY = start.y - TOW_TUG.h * TUG_SCALE + 6;
  // The tug faces the plane's tail, its tow bar hooked under it.
  const hooked = hull.x + 20 - tugW;
  const away = -hull.w - 120;

  const draw = (elapsed: number): void => {
    const come = EASE.out(
      keyframe(elapsed, [
        [0, 0],
        [1200, 1],
      ]),
    );
    const haul = EASE.in(
      keyframe(elapsed, [
        [1300, 0],
        [TOW_MS, 1],
      ]),
    );
    const shift = (away - hull.x) * haul;
    const tugX = lerp(-tugW - 20, hooked, come) + shift;

    // Mirrored around its left edge, so it is placed by its right one.
    poseSprite(tug, { x: tugX + tugW, y: tugY, scaleX: -1, scaleY: 1 });
    plane.place({ x: start.x + shift, y: start.y, r: 0 });

    const leave = EASE.in(
      keyframe(elapsed, [
        [400, 0],
        [3000, 1],
      ]),
    );
    wreck.truck.place(lerp(truckFrom, layout.width + 60, leave), truckFeet, 'steady', elapsed);
  };

  return runTimeline(host.clock, host.reducedMotion, { duration: TOW_MS, draw }, () => {
    plane.node.remove();
    wreck.layer.remove();
    done();
  });
}
