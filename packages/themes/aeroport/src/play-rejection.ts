import { crewMarkup } from './crew-markup.ts';
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
import { suitcaseMarkup } from './suitcase-markup.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 4000;
const SCALE = 1.6;
const ARC = 60;

/**
 * rejection: something is sent back. A handler throws a suitcase with a luggage tag painted with the tag
 * ("À REVOIR", "REFUSÉ") in a high arc toward the rejected-baggage pile, where it lands; the pile counts one more.
 * Key pose: the suitcase landed, its tag readable, the handler's arm still up.
 * @example
 * director.play(rejectionEvent); // through gagFor(event) === playRejection
 */
export const playRejection: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2400,
  room: (stage, event) => ({
    w: suitcaseMarkup(tagWord(event, stage.text.board.roles.rejection).length).width * SCALE + 180,
    h: 54 * SCALE + ARC + 40,
    bands: ['ground'],
    near: { x: stage.layout.pile.x + 160, y: stage.layout.pile.feetY },
  }),
  build({ text }, event, room, layer) {
    const { spot, floor } = room;
    const word = tagWord(event, text.board.roles.rejection);
    const art = suitcaseMarkup(word.length);
    const caseW = art.width * SCALE;
    const caseH = art.height * SCALE;
    const handlerX = spot.x + spot.w - 30;

    const handler = figureSprite(layer, crewMarkup('up'), { scale: 1.8, facingLeft: true, part: 'handler' });
    const suitcase = createSprite(layer, svgMarkup(art.markup), 'tossed-suitcase');
    fillSlot(suitcase, 'tag', word);

    const from = { x: handlerX - 30 - caseW, y: floor - caseH - 30 };
    const to = { x: spot.x + 10, y: floor - caseH };

    return {
      captionX: to.x + caseW / 2,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const flight = EASE.inOut(
          keyframe(elapsed, [
            [300, 0],
            [1500, 1],
          ]),
        );
        const hop = keyframe(elapsed, [
          [1500, 0],
          [1600, 6],
          [1700, 0],
        ]);

        handler.place(handlerX, floor, life);
        poseSprite(suitcase, {
          x: lerp(from.x, to.x, flight),
          y: lerp(from.y, to.y, flight) - Math.sin(flight * Math.PI) * ARC - hop,
          opacity: life,
        });
      },
    };
  },
});
