import type { Point } from '@deskorama/core';
import { keyframe } from './keyframe.ts';

/** How dark the slate gets, at its darkest. */
const DARKEST = 0.35;

/** The slate dim of a failed deploy: the airport darkens around one point. */
export interface Slate {
  /** Shows the dim `elapsed` ms into its life of `duration` ms: it darkens, holds, then lifts. */
  readonly draw: (elapsed: number) => void;
  readonly dispose: () => void;
}

/**
 * Returns the slate that darkens the whole airport, except a circle around `centre` (the stranded plane, the fire
 * station), for a few seconds. One still gradient whose opacity alone changes. It goes into `parent` just before
 * `under` (the stranded plane), or at the end, so it falls over the poster and under the scene's actors.
 * @example
 * const slate = createSlate(root, { x: 480, y: 760 }, 6000, plane.node);
 * slate.draw(3000);
 */
export function createSlate(parent: HTMLElement, centre: Point, duration: number, under?: Element): Slate {
  const node = document.createElement('div');
  node.className = 'aeroport-slate';
  node.dataset['part'] = 'slate';
  node.style.background = `radial-gradient(circle at ${Math.round(centre.x)}px ${Math.round(centre.y)}px, transparent 0 110px, var(--ink) 250px)`;
  node.style.opacity = '0';
  parent.insertBefore(node, under ?? null);

  return {
    draw(elapsed) {
      const dim = keyframe(elapsed, [
        [0, 0],
        [duration * 0.12, DARKEST],
        [duration * 0.85, DARKEST],
        [duration, 0],
      ]);
      node.style.opacity = dim.toFixed(3);
    },
    dispose: () => node.remove(),
  };
}
