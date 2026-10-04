import { crewMarkup } from './crew-markup.ts';
import { EASE } from './ease.ts';
import { figureSprite } from './figure-sprite.ts';
import { fillSlot } from './fill-slot.ts';
import { flagMarkup, POLE_HEIGHT } from './flag-markup.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4400;

/**
 * publish: something new goes out. A ground agent hoists an orange flag painted with the tag ("v2.5.0",
 * "NOUVEAU"), which flutters at the top of its pole. Key pose: the flag up, the agent's arm raised.
 * @example
 * director.play(publishEvent); // through gagFor(event) === playPublish
 */
export const playPublish: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2400,
  room: (stage, event) => ({
    w: flagMarkup(tagWord(event, stage.text.paint.flag, true).length).width + 80,
    h: POLE_HEIGHT + 4,
    bands: ['ground'],
    near: { x: stage.layout.width * 0.7, y: stage.layout.queue.feetY },
  }),
  build({ text }, event, room, layer) {
    const { spot, floor } = room;
    const word = tagWord(event, text.paint.flag, true);
    const art = flagMarkup(word.length);
    const poleX = spot.x + 60;

    const agent = figureSprite(layer, crewMarkup('up'), { scale: 1.8, facingLeft: false, part: 'flag-agent' });
    const pole = createSprite(layer, svgMarkup(art.markup), 'flag');
    fillSlot(pole, 'tag', word);
    const flag = pole.querySelector('.flag');

    return {
      captionX: poleX + art.width / 2,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const hoist = EASE.out(
          keyframe(elapsed, [
            [250, 0],
            [1750, 1],
          ]),
        );
        const flutter =
          elapsed > 1750
            ? Math.sin((elapsed - 1750) / 120) *
              3 *
              keyframe(elapsed, [
                [1750, 1],
                [3000, 0],
              ])
            : 0;

        agent.place(poleX - 18, floor, life);
        poseSprite(pole, { x: poleX, y: floor - POLE_HEIGHT, opacity: life });
        flag?.setAttribute(
          'transform',
          `translate(0 ${lerp(POLE_HEIGHT - 38, 0, hoist).toFixed(1)}) skewY(${flutter.toFixed(2)})`,
        );
      },
    };
  },
});
