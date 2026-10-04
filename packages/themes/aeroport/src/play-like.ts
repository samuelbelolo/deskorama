import { figureSprite } from './figure-sprite.ts';
import { fillSlot } from './fill-slot.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { COATS, personMarkup, SKINS } from './person-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';
import { THUMB_HEIGHT, thumbBalloonMarkup } from './thumb-balloon-markup.ts';

const DURATION = 4600;

/** How high the balloon rises above the passenger's hand. */
const RISE = 90;

/** How high it rises when room is short: it drifts up out of sight sooner. */
const LOW_RISE = 30;

/**
 * like: someone gives a thumbs-up. A passenger on the apron holds a big orange thumbs-up balloon with the tag on its
 * cuff ("+1", "LGTM"), then lets it go and it drifts up. A thumb, so it never reads as an approval's stamp.
 * Key pose: the passenger holding the thumb up.
 * @example
 * director.play(likeEvent); // through gagFor(event) === playLike
 */
export const playLike: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 1200,
  room: (stage) =>
    [RISE, LOW_RISE].map((rise) => ({
      w: 160,
      h: THUMB_HEIGHT + rise + 30,
      bands: ['ground'],
      near: { x: stage.layout.width * 0.62, y: stage.layout.queue.feetY },
    })),
  build({ host, text }, event, room, layer) {
    const { spot, top, floor } = room;
    const word = tagWord(event, text.board.roles.like);
    const art = thumbBalloonMarkup(word.length);
    const handX = spot.x + spot.w / 2;
    const handY = floor - 28;

    const coat = COATS[Math.floor(host.random.next() * COATS.length)] ?? COATS[0];
    const skin = SKINS[Math.floor(host.random.next() * SKINS.length)] ?? SKINS[0];
    const passenger = figureSprite(layer, personMarkup({ coat, skin }), { scale: 1.8, facingLeft: false, part: 'fan' });
    const balloon = createSprite(layer, svgMarkup(art.markup), 'thumb-balloon');
    fillSlot(balloon, 'tag', word);

    return {
      captionX: handX,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const up = keyframe(elapsed, [
          [1700, 0],
          [DURATION, 1],
        ]);
        const sway = Math.sin(elapsed / 260) * 5 * up;
        const y = lerp(handY - THUMB_HEIGHT, Math.max(top, handY - THUMB_HEIGHT - RISE), up * up);

        passenger.place(handX - 10, floor, life);
        poseSprite(balloon, { x: handX - art.width / 2 + sway, y, opacity: life });
      },
    };
  },
});
