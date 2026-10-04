import type { Rect } from '@deskorama/core';
import { caravelleMarkup } from './caravelle-markup.ts';
import { createSceneSprite } from './create-scene-sprite.ts';
import { PLANE, type GearPose } from './flight-geometry.ts';
import { poseSprite } from './pose-sprite.ts';
import { svgMarkup } from './svg-markup.ts';

/** The PROD Caravelle on screen. */
export interface DeployPlane {
  readonly node: HTMLElement;
  /** Its drawing, where the foam of a failed deploy sticks so it moves with the plane. */
  readonly art: SVGSVGElement;
  /** Where its main gear is now. */
  readonly pose: () => GearPose;
  /** Places it by its main gear, pitched around it. */
  readonly place: (pose: GearPose, opacity?: number) => void;
  /** Paints `name` big over its cheatline, `progress` (0 to 1) of the way from its title to the name. */
  readonly christen: (name: string, progress: number) => void;
  /** The box its unpitched drawing takes at its current pose, in screen pixels. */
  readonly box: () => Rect;
}

/**
 * Returns the PROD Caravelle facing right, titled with the flight's name, placed by its main gear at `at` and ready
 * for its christening: the deploy's tag is written into its name slot as plain text.
 * @example
 * const plane = createDeployPlane(layer, 'VOL PROD', { x: 255, y: 814, r: 0 });
 * plane.christen('v2.5.0', 1);
 */
export function createDeployPlane(parent: HTMLElement, title: string, at: GearPose): DeployPlane {
  const art = svgMarkup(caravelleMarkup({ title, scale: PLANE.scale, facing: 'right', christening: true }));
  const node = createSceneSprite(parent, art, 'deploy-plane');
  node.style.transformOrigin = `${PLANE.gear.x}px ${PLANE.gear.y}px`;

  const slot = (name: string): SVGElement | null => art.querySelector(`[data-slot="${name}"]`);
  let current = at;

  const place = (pose: GearPose, opacity = 1): void => {
    current = pose;
    poseSprite(node, { x: pose.x - PLANE.gear.x, y: pose.y - PLANE.gear.y, rotate: pose.r, opacity });
  };

  place(at);

  return {
    node,
    art,
    pose: () => current,
    place,
    christen(name, progress) {
      const named = slot('name');
      if (named !== null) named.textContent = name;

      named?.setAttribute('opacity', progress.toFixed(3));
      slot('sub')?.setAttribute('opacity', progress.toFixed(3));
      slot('title')?.setAttribute('opacity', (1 - progress).toFixed(3));
    },
    box: () => ({ x: current.x - PLANE.gear.x, y: current.y - PLANE.gear.y, w: PLANE.w, h: PLANE.h }),
  };
}
