import { createSprite } from './create-sprite.ts';
import { EASE } from './ease.ts';
import { fillSlot } from './fill-slot.ts';
import { GOLDEN_JET, GOLDEN_PATIENCE, GOLDEN_SCALE, goldenJetMarkup } from './golden-jet-markup.ts';
import { HEART_BOX, heartMarkup } from './heart-markup.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { poseSprite } from './pose-sprite.ts';
import type { GagScript } from './gag-script.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 6000;

/** The patch of sky the show needs, and the heart drawn in it. */
const ROOM = { w: 700, h: 200 } as const;
const HEART_SCALE = 1.4;

/** How long the jet takes to cross, and when the heart draws itself in its wake. */
const CROSS_MS = 4200;
const DRAW = { from: 900, to: 2900 } as const;

/**
 * celebration, in the sky: the golden jet crosses a free patch of sky at more than twice its size and leaves a big
 * gold heart in its contrail, the tag ("1 000") inside it. Key pose: the heart drawn, the jet leaving it.
 * @example
 * scriptedGags([GOLDEN_SKY, GOLDEN_RUNWAY]); // the sky first, when a patch of it shows
 */
export const GOLDEN_SKY: GagScript = {
  duration: DURATION,
  keyPose: 3200,
  patience: GOLDEN_PATIENCE,
  room: (stage) => ({
    w: ROOM.w,
    h: ROOM.h,
    bands: [stage.layout.skyBand],
    near: { x: stage.layout.width * 0.35, y: 180 },
  }),
  build({ text }, event, room, layer) {
    const { spot, top, floor } = room;
    const jetW = GOLDEN_JET.w * GOLDEN_SCALE;
    const heartW = HEART_BOX.w * HEART_SCALE;
    const heartH = HEART_BOX.h * HEART_SCALE;
    const heartX = spot.x + (spot.w - heartW) / 2;

    const heart = createSprite(layer, svgMarkup(heartMarkup(heartW, heartH, 'gold-trail')), 'gold-heart');
    fillSlot(heart, 'tag', tagWord(event, text.board.roles.celebration));
    const stroke = heart.querySelector<SVGElement>('[data-slot="heart"]');

    const jet = createSprite(layer, svgMarkup(goldenJetMarkup(GOLDEN_SCALE)), 'golden-jet');
    jet.querySelector('[data-slot="gear"]')?.setAttribute('opacity', '0');

    return {
      captionX: spot.x + spot.w / 2,
      draw(elapsed) {
        const cross = elapsed / CROSS_MS;
        const flying = keyframe(elapsed, [
          [0, 0],
          [200, 1],
          [CROSS_MS - 300, 1],
          [CROSS_MS, 0],
        ]);
        poseSprite(jet, {
          x: lerp(spot.x, spot.x + spot.w - jetW, cross),
          y: top + Math.sin(cross * Math.PI) * 10,
          opacity: flying,
        });

        const drawn = EASE.inOut(
          keyframe(elapsed, [
            [DRAW.from, 0],
            [DRAW.to, 1],
          ]),
        );
        stroke?.style.setProperty('stroke-dashoffset', (1 - drawn).toFixed(3));
        poseSprite(heart, { x: heartX, y: floor - heartH, opacity: lifeOpacity(elapsed, DURATION) });
      },
    };
  },
};
