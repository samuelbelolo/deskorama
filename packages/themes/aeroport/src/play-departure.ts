import { crewMarkup } from './crew-markup.ts';
import { CUB, cubMarkup } from './cub-markup.ts';
import { EASE } from './ease.ts';
import { figureSprite } from './figure-sprite.ts';
import { fillSlot } from './fill-slot.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4600;
const SCALE = 2.2;

/** How far the Cub's nose lifts at take-off, in degrees, and the height that costs its drawing. */
const CLIMB_DEGREES = 6;
const CLIMB_ALLOWANCE = 18;

/**
 * departure: something leaves, whoever or whatever it is. A Cub painted with the tag ("BRANCHE", "-1") sits on the
 * runway, a crew member waves it off, it rolls away, lifts its nose and climbs out. Key pose: the Cub rolling away
 * under the wave.
 * @example
 * director.play(departureEvent); // through gagFor(event) === playDeparture
 */
export const playDeparture: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2600,
  room: (stage) => ({
    w: 400,
    h: CUB.h * SCALE + CLIMB_ALLOWANCE + 30,
    bands: [stage.layout.runwayBand, 'ground'],
    near: { x: stage.layout.width * 0.35, y: stage.layout.runwayTop + 40 },
  }),
  build(_stage, event, room, layer) {
    const { spot, top, floor } = room;
    const cubW = CUB.w * SCALE;
    const startX = spot.x + 70;
    const endX = spot.x + spot.w - cubW;
    const cubH = CUB.h * SCALE;

    const crew = figureSprite(layer, crewMarkup('up'), { scale: 1.8, facingLeft: false, part: 'waving-crew' });
    const cub = createSprite(layer, svgMarkup(cubMarkup(SCALE)), 'departing-cub');
    fillSlot(cub, 'tag', tagWord(event, ''));

    return {
      captionX: startX + cubW / 2,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const roll = EASE.inOut(
          keyframe(elapsed, [
            [1200, 0],
            [3900, 1],
          ]),
        );
        const lift = keyframe(roll, [
          [0.55, 0],
          [1, 1],
        ]);
        const highest = top + CLIMB_ALLOWANCE;
        const y = lerp(floor - cubH, highest, lift);

        crew.place(spot.x + 26, floor, life);
        poseSprite(cub, { x: lerp(startX, endX, roll), y, rotate: -CLIMB_DEGREES * lift, opacity: life });
      },
    };
  },
});
