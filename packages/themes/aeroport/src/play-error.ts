import { EASE } from './ease.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { pigeonMarkup } from './pigeon-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';

const DURATION = 5600;

/** A pigeon at this size is 42 x 36 px: big and pale enough to read on the dark runway at a glance. */
const SCALE = 3;
const BIRD = { w: 14 * SCALE, h: 12 * SCALE } as const;

/** Where each pigeon lands across its room, as a share of the width, and when it lands. */
const FLOCK = [
  { at: 0.12, land: 900 },
  { at: 0.45, land: 1200 },
  { at: 0.78, land: 1500 },
] as const;

/**
 * error: something broke. A small flock of pigeons flaps down onto the runway and sits there, holding everything
 * up, then takes off together. Key pose: three pigeons sitting on the tarmac.
 * @example
 * director.play(errorEvent); // through gagFor(event) === playError
 */
export const playError: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 3200,
  room: (stage) => ({
    w: 320,
    h: BIRD.h + 60,
    bands: [stage.layout.runwayBand, 'ground'],
    near: { x: stage.layout.width * 0.45, y: stage.layout.runwayTop + 60 },
  }),
  build(_stage, _event, room, layer) {
    const { spot, top, floor } = room;
    const birds = FLOCK.map(({ at, land }) => ({
      land,
      x: spot.x + 20 + at * (spot.w - BIRD.w - 40),
      flying: createSprite(layer, birdSvg(true), 'pigeon'),
      sitting: createSprite(layer, birdSvg(false), 'pigeon'),
    }));

    return {
      captionX: spot.x + spot.w / 2,
      draw(elapsed) {
        for (const bird of birds) {
          const down = EASE.out(
            keyframe(elapsed, [
              [bird.land - 900, 0],
              [bird.land, 1],
            ]),
          );
          const away = EASE.in(
            keyframe(elapsed, [
              [4400, 0],
              [DURATION, 1],
            ]),
          );
          const sat = elapsed >= bird.land && elapsed < 4400;
          const x = lerp(bird.x - 60, bird.x, down) + away * 60;
          const y = lerp(top, floor - BIRD.h, down) - away * (floor - BIRD.h - top);
          const shown = keyframe(elapsed, [
            [bird.land - 900, 0],
            [bird.land - 700, 1],
            [DURATION - 200, 1],
            [DURATION, 0],
          ]);

          poseSprite(bird.flying, { x, y, opacity: sat ? 0 : shown });
          poseSprite(bird.sitting, { x, y, opacity: sat ? shown : 0 });
        }
      },
    };
  },
});

/**
 * Returns one pigeon's drawing at its Gag's size, wings up or folded.
 * @example
 * birdSvg(true).getAttribute('width'); // "42"
 */
function birdSvg(flapping: boolean): SVGSVGElement {
  return svgMarkup(
    `<svg width="${BIRD.w}" height="${BIRD.h}" viewBox="0 -2 14 12" overflow="visible">${pigeonMarkup(flapping)}</svg>`,
  );
}
