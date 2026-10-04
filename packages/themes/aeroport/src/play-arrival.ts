import { CUB, cubMarkup } from './cub-markup.ts';
import { EASE } from './ease.ts';
import { figureSprite } from './figure-sprite.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { personMarkup, SKINS } from './person-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';

const DURATION = 5600;
const SCALE = 1.8;

/** Where the Cub's door is along its drawing, in units. */
const DOOR_X = 44;

/**
 * arrival: someone new arrives. A Cub glides down onto the runway, rolls to a stop, and its passenger steps off
 * with a roller case and walks toward the terminal. Key pose: the Cub stopped, the passenger beside it.
 * @example
 * director.play(arrivalEvent); // through gagFor(event) === playArrival
 */
export const playArrival: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 3600,
  room: (stage) => ({
    w: 400,
    h: CUB.h * SCALE + 50,
    bands: [stage.layout.runwayBand, 'ground'],
    near: { x: stage.layout.width * 0.3, y: stage.layout.runwayTop + 40 },
  }),
  build({ host }, _event, room, layer) {
    const { spot, top, floor } = room;
    const cubW = CUB.w * SCALE;
    const cubH = CUB.h * SCALE;
    const stopX = spot.x + spot.w - cubW - 10;
    const door = stopX + DOOR_X * SCALE;

    const cub = createSprite(layer, svgMarkup(cubMarkup(SCALE)), 'arriving-cub');
    const skin = SKINS[Math.floor(host.random.next() * SKINS.length)] ?? SKINS[0];
    const look = { coat: 'var(--ink)', skin, bag: 'roller' as const };
    const passenger = figureSprite(layer, personMarkup(look), { scale: 1.8, facingLeft: true, part: 'passenger' });

    return {
      captionX: door,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const glide = EASE.out(
          keyframe(elapsed, [
            [0, 0],
            [1600, 1],
          ]),
        );
        const roll = EASE.out(
          keyframe(elapsed, [
            [1600, 0],
            [2400, 1],
          ]),
        );
        const x = elapsed < 1600 ? lerp(spot.x, stopX - 70, glide) : lerp(stopX - 70, stopX, roll);
        const y = lerp(top, floor - cubH, glide);

        poseSprite(cub, { x, y, rotate: lerp(4, 0, glide), opacity: life });

        const out = keyframe(elapsed, [
          [2500, 0],
          [2700, 1],
        ]);
        const walk = EASE.inOut(
          keyframe(elapsed, [
            [2700, 0],
            [3700, 1],
          ]),
        );
        const step = walk > 0 && walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 6)) * 1.5 : 0;
        passenger.place(lerp(door, door - 80, walk), floor - step, Math.min(out, life));
      },
    };
  },
});
