import { createRandom, type Point } from '@deskorama/core';
import { createSceneSprite } from './create-scene-sprite.ts';
import { keyframe } from './keyframe.ts';
import { poseSprite } from './pose-sprite.ts';
import { svgMarkup } from './svg-markup.ts';

/** How many blobs of foam pile up on the plane, and how many drops the stream carries at once. */
const BLOBS = 46;
const DROPS = 14;

/** The seed of the blobs' places, so the meringue looks the same on every run. */
const FOAM_SEED = 42;

/** How long one blob takes to swell, and one drop to fly from the nozzle to the plane. */
const SWELL_MS = 700;
const DROP_MS = 520;

/** How the foaming goes: when it starts, how long the blobs take to cover the plane, when the stream stops. */
export interface FoamTiming {
  readonly start: number;
  readonly grow: number;
  readonly streamEnd: number;
}

/** The foam of a failed deploy: blobs on the plane and the stream from the truck. */
export interface Foam {
  /**
   * Draws the foam `elapsed` ms into the scene: the blobs swell from the tail to the nose, the drops arc from
   * `nozzle` to `target`. With `full`, every blob is at its full size.
   */
  readonly draw: (elapsed: number, ends: { nozzle: Point; target: Point }, full?: boolean) => void;
  /** Takes the stream down; the blobs stay on the plane. */
  readonly dispose: () => void;
}

/**
 * Returns the foam that turns the stranded Caravelle into a meringue. The blobs live inside the plane's own drawing
 * (in its 300 x 86 units), so a tow drags plane and foam away together; the stream's drops live in `layer`.
 * @example
 * const foam = createFoam(plane.art, layer, { start: 1350, grow: 5200, streamEnd: 7150 });
 * foam.draw(3000, { nozzle: truck.nozzle(), target: { x: 300, y: 760 } });
 */
export function createFoam(planeArt: SVGSVGElement, layer: HTMLElement, timing: FoamTiming): Foam {
  const random = createRandom(FOAM_SEED);
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'foam-blobs');
  planeArt.append(group);

  const blobs = Array.from({ length: BLOBS }, (_, i) => blob(group, i, () => random.next()));
  // The blobs swell from the tail toward the nose.
  blobs.sort((a, b) => a.x - b.x);

  const drops = Array.from({ length: DROPS }, () =>
    createSceneSprite(
      layer,
      svgMarkup('<svg width="12" height="12" viewBox="-6 -6 12 12"><circle class="spray" r="5"/></svg>'),
      'foam-drop',
    ),
  );

  return {
    draw(elapsed, ends, full = false) {
      blobs.forEach((each, i) => {
        const begin = timing.start + (i / BLOBS) * timing.grow;
        const swell = full
          ? 1
          : keyframe(elapsed, [
              [begin, 0],
              [begin + SWELL_MS, 1],
            ]);
        each.node.setAttribute('r', swell === 0 ? '0' : (each.r * (0.3 + 0.7 * swell)).toFixed(1));
      });

      const on = keyframe(elapsed, [
        [timing.start, 0],
        [timing.start + 150, 1],
        [timing.streamEnd, 1],
        [timing.streamEnd + 300, 0],
      ]);
      drops.forEach((drop, i) => {
        const p = ((elapsed - timing.start) / DROP_MS + i / DROPS) % 1;
        const x = ends.nozzle.x + (ends.target.x - ends.nozzle.x) * p;
        const y = ends.nozzle.y + (ends.target.y - ends.nozzle.y) * p - Math.sin(p * Math.PI) * 46;
        const size = 0.6 + p * 0.8;
        poseSprite(drop, { x: x - 6, y: y - 6, scaleX: size, scaleY: size, opacity: on });
      });
    },
    dispose() {
      for (const drop of drops) drop.remove();
    },
  };
}

/**
 * Adds one blob of foam to the group, at nothing yet, and returns it with its full radius and its place along the
 * fuselage: more blobs on top, every third one bigger.
 * @example
 * blob(group, 0, () => 0.5); // { node, x: 41.6, r: 12.5 }
 */
function blob(group: SVGGElement, index: number, next: () => number): { node: SVGCircleElement; x: number; r: number } {
  const along = 0.08 + 0.9 * ((index * 0.618) % 1);
  const x = 20 + along * 270;
  const top = index % 3 === 0;
  const y = top ? 30 + next() * 8 : 40 + next() * 18;
  const r = top ? 9 + next() * 7 : 7 + next() * 6;

  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('class', 'foam');
  node.setAttribute('cx', x.toFixed(1));
  node.setAttribute('cy', y.toFixed(1));
  node.setAttribute('r', '0');
  group.append(node);

  return { node, x, r };
}
