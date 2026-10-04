import { coinMarkup } from './coin-markup.ts';
import { createSprite } from './create-sprite.ts';
import { EASE } from './ease.ts';
import { fillSlot } from './fill-slot.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { MONEY_POP, moneyPopMarkup } from './money-pop-markup.ts';
import { poseSprite } from './pose-sprite.ts';
import { sackMarkup } from './sack-markup.ts';
import { scriptedGag } from './scripted-gag.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';
import { VAN, vanMarkup } from './van-markup.ts';

const DURATION = 5000;

/** How high the amount rises once it pops. */
const RISE = 16;

/** Where the coins fly, from the sack's mouth, in pixels. */
const COINS = [
  [-34, -46],
  [-14, -60],
  [8, -64],
  [28, -52],
  [44, -38],
] as const;

/**
 * money: money comes in. The armoured cash van pulls up, a sack marked with the currency sign drops out of the
 * back, bursts into orange coins, and the tag ("+49 €", "+$10") pops above it with the till's ring. Key pose: the
 * van, the sack and the amount.
 * @example
 * director.play(moneyEvent); // through gagFor(event) === playMoney
 */
export const playMoney: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2600,
  room: (stage) => ({
    w: VAN.w + MONEY_POP.w + 70,
    h: VAN.h + MONEY_POP.h + RISE + 8,
    bands: ['ground'],
    near: { x: stage.layout.width * 0.66, y: stage.layout.queue.feetY },
  }),
  build({ text }, event, room, layer) {
    const { spot, floor } = room;
    const sign = currencyOf(event.meta.tag);
    const stopX = spot.x + 10;
    const sackX = stopX + VAN.w + 20;

    const van = createSprite(layer, svgMarkup(vanMarkup(text.paint.cashVan)), 'cash-van');
    fillSlot(van, 'sign', sign);
    const sack = createSprite(layer, svgMarkup(sackMarkup()), 'money-sack');
    fillSlot(sack, 'sign', sign);
    const coins = COINS.map(() => createSprite(layer, svgMarkup(coinMarkup()), 'coin'));
    const pop = createSprite(layer, svgMarkup(moneyPopMarkup()), 'money-pop');
    fillSlot(pop, 'tag', event.meta.tag.toUpperCase());
    fillSlot(pop, 'ring', text.paint.kaching);

    return {
      captionX: sackX + 17,
      draw(elapsed) {
        const life = lifeOpacity(elapsed, DURATION);
        const arrive = EASE.out(
          keyframe(elapsed, [
            [0, 0],
            [1000, 1],
          ]),
        );
        poseSprite(van, { x: lerp(spot.x + spot.w - VAN.w, stopX, arrive), y: floor - VAN.h, opacity: life });

        const drop = keyframe(elapsed, [
          [1000, 0],
          [1300, 1],
        ]);
        poseSprite(sack, { x: sackX, y: floor - 36 - (1 - drop) * 16, opacity: Math.min(drop, life) });

        poseCoins(coins, elapsed, { x: sackX + 30, y: floor - 40 });

        const rise = EASE.out(
          keyframe(elapsed, [
            [1500, 0],
            [1900, 1],
          ]),
        );
        const popY = floor - VAN.h - MONEY_POP.h - RISE * rise + RISE;
        poseSprite(pop, { x: sackX + 17 - MONEY_POP.w / 2, y: popY, opacity: Math.min(rise, life) });
      },
    };
  },
});

/**
 * Poses the coins as they burst out of the sack's mouth in a fan, spinning, then fall and fade.
 * @example
 * poseCoins(coins, 1800, { x: 330, y: 700 });
 */
function poseCoins(coins: readonly HTMLElement[], elapsed: number, mouth: { x: number; y: number }): void {
  coins.forEach((coin, i) => {
    const [dx, dy] = COINS[i] ?? [0, 0];
    const fly = keyframe(elapsed, [
      [1400 + i * 60, 0],
      [2200 + i * 60, 1],
    ]);
    const opacity = keyframe(fly, [
      [0, 0],
      [0.1, 1],
      [0.85, 1],
      [1, 0],
    ]);
    const x = mouth.x + dx * fly * 0.6;
    const y = mouth.y + dy * Math.sin(fly * Math.PI) * 0.8;

    poseSprite(coin, { x, y, scaleX: Math.cos(fly * Math.PI * 4), opacity });
  });
}

/**
 * Returns the currency sign in a tag, or the euro sign when it has none.
 * @example
 * currencyOf('+$10'); // "$"
 * currencyOf('+49 €'); // "€"
 */
function currencyOf(tag: string): string {
  return /[€$£¥]/u.exec(tag)?.[0] ?? '€';
}
