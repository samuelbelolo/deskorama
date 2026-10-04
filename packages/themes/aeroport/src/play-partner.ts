import { createBubble } from './create-bubble.ts';
import { crewMarkup } from './crew-markup.ts';
import { figureSprite } from './figure-sprite.ts';
import { fillSlot } from './fill-slot.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { personMarkup } from './person-markup.ts';
import { pickLine } from './pick-line.ts';
import { placardMarkup } from './placard-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';
import type { Gag } from './stage.ts';

const DURATION = 4800;
const SCALE = 1.8;

/**
 * partner: someone joins the crew. A greeter waits at the end of the apron holding up a name placard painted with
 * the tag ("BIENVENUE", "40 SEATS"), and the newcomer walks in with a flight bag, glad to be on board: a new
 * colleague, never the boss. Key pose: the two face each other, the newcomer speaking.
 * @example
 * director.play(partnerEvent); // through gagFor(event) === playPartner
 */
export const playPartner: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2600,
  room: (stage) => ({
    w: 360,
    h: 112,
    bands: ['ground'],
    near: { x: stage.layout.width * 0.75, y: stage.layout.queue.feetY },
  }),
  build({ host, text }, event, room, layer) {
    const { spot, floor } = room;
    const word = tagWord(event, text.paint.placard);
    const placard = placardMarkup(word.length);
    const greeterX = spot.x + spot.w - Math.max(40, placard.width / 2 + 6);
    const meetX = greeterX - 90;

    const greeter = figureSprite(layer, crewMarkup('up'), { scale: SCALE, facingLeft: true, part: 'greeter' });
    const sign = createSprite(layer, svgMarkup(placard.markup), 'placard');
    fillSlot(sign, 'tag', word);

    const look = { coat: 'var(--cobalt)', skin: '#f0d2b8', hat: true, bag: 'flight' as const };
    const newcomer = figureSprite(layer, personMarkup(look), { scale: SCALE, facingLeft: false, part: 'newcomer' });
    const head = { x: meetX, y: floor - newcomer.height };
    const bubble = createBubble(layer, pickLine(text.lines.newcomer, host.random), { head, room: spot });

    return {
      captionX: meetX + 30,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const walk = keyframe(elapsed, [
          [0, 0],
          [1800, 1],
        ]);
        const step = walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 7)) * 1.6 : 0;

        greeter.place(greeterX, floor, life);
        poseSprite(sign, { x: greeterX - placard.width / 2 + 4, y: floor - greeter.height - 30, opacity: life });
        newcomer.place(lerp(spot.x + 30, meetX, walk), floor - step, life);
        bubble.node.style.opacity = keyframe(elapsed, [
          [1700, 0],
          [1900, 1],
          [4200, 1],
          [4400, 0],
        ]).toFixed(3);
      },
    };
  },
});
