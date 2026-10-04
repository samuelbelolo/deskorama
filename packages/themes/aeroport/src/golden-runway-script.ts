import { createSprite } from './create-sprite.ts';
import { EASE } from './ease.ts';
import { fillSlot } from './fill-slot.ts';
import { GOLDEN_JET, GOLDEN_PATIENCE, GOLDEN_SCALE, goldenJetMarkup } from './golden-jet-markup.ts';
import { heartMarkup } from './heart-markup.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { poseSprite } from './pose-sprite.ts';
import type { GagScript } from './gag-script.ts';
import { svgMarkup } from './svg-markup.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 9400;

/** The stretches of runway the show can play on, longest first, and the heart painted on it, flat. */
const LANES = [700, 560, 420] as const;
const HEART = { w: 300, h: 64 } as const;

/** How high the jet skims the runway on its low pass, gear up. */
const SKIM = 8;

/** The show's beats: the low pass, the heart painted, the landing, the carpet, and the jet rolling away. */
const PASS = { from: 0, to: 2500 } as const;
const PAINT = { from: 500, to: 2300 } as const;
const LANDING = { from: 2500, to: 4900 } as const;
const CARPET = { from: 5200, to: 5800 } as const;
const LEAVE = { from: 8200, to: 9200 } as const;

/**
 * celebration, on the runway, when no sky shows: the golden jet, at more than twice its size, makes a low pass gear
 * up and paints a gold heart on the tarmac with the tag ("1 000") in it, comes back gear down and lands, and an
 * orange carpet rolls out from its door. Key pose: the jet stopped by its heart, the carpet out.
 * @example
 * scriptedGags([GOLDEN_SKY, GOLDEN_RUNWAY]); // the runway when the sky is covered
 */
export const GOLDEN_RUNWAY: GagScript = {
  duration: DURATION,
  keyPose: 6000,
  patience: GOLDEN_PATIENCE,
  room: (stage) =>
    LANES.map((w) => ({
      w,
      h: GOLDEN_JET.wheels * GOLDEN_SCALE + SKIM,
      bands: [stage.layout.runwayBand],
      near: { x: stage.layout.width * 0.35, y: stage.layout.runwayTop + 40 },
    })),
  build({ text }, event, room, layer) {
    const { spot, floor } = room;
    const jetW = GOLDEN_JET.w * GOLDEN_SCALE;
    const ground = floor - GOLDEN_JET.wheels * GOLDEN_SCALE;
    const stop = spot.x + spot.w * 0.45 - jetW / 2;
    const heartW = Math.min(HEART.w, spot.w - 40);
    const heartX = spot.x + (spot.w - heartW) / 2;
    const door = stop + 112 * GOLDEN_SCALE;

    const heart = createSprite(layer, svgMarkup(heartMarkup(heartW, HEART.h, 'tarmac-heart')), 'tarmac-heart');
    const stroke = heart.querySelector<SVGElement>('[data-slot="heart"]');
    const tag = createSprite(layer, tagMarkup(heartW), 'heart-tag');
    fillSlot(tag, 'tag', tagWord(event, text.board.roles.celebration));

    const carpet = createSprite(layer, carpetMarkup(spot.x + spot.w - door), 'carpet');
    const jet = createSprite(layer, svgMarkup(goldenJetMarkup(GOLDEN_SCALE)), 'golden-jet');
    const gear = jet.querySelector('[data-slot="gear"]');

    return {
      captionX: stop + jetW / 2,
      draw(elapsed) {
        const painted = EASE.inOut(
          keyframe(elapsed, [
            [PAINT.from, 0],
            [PAINT.to, 1],
          ]),
        );
        const fade =
          1 -
          keyframe(elapsed, [
            [PAINT.to, 0],
            [DURATION, 1],
          ]) **
            2;
        stroke?.style.setProperty('stroke-dashoffset', (1 - painted).toFixed(3));
        poseSprite(heart, { x: heartX, y: floor - HEART.h - 4, opacity: fade });
        poseSprite(tag, { x: heartX, y: floor - HEART.h + 10, opacity: Math.min(painted, fade) });

        const rolled = EASE.out(
          keyframe(elapsed, [
            [CARPET.from, 0],
            [CARPET.to, 1],
          ]),
        );
        poseSprite(carpet, {
          x: door,
          y: floor - 8,
          scaleX: Math.max(0.001, rolled),
          scaleY: 1,
          opacity: lifeOpacity(elapsed, DURATION),
        });

        gear?.setAttribute('opacity', elapsed < LANDING.from ? '0' : '1');
        poseSprite(jet, jetPose(elapsed, { lane: spot, jetW, ground, stop }));
      },
    };
  },
};

/**
 * Returns the jet's pose in the show: skimming across gear up, then back from the left to land and stop, then
 * rolling away.
 * @example
 * jetPose(3000, { lane, jetW: 308, ground: 727, stop: 362 }); // gliding down toward its stop
 */
function jetPose(
  elapsed: number,
  show: { lane: { x: number; w: number }; jetW: number; ground: number; stop: number },
): { x: number; y: number; opacity: number } {
  const { lane, jetW, ground, stop } = show;

  if (elapsed < LANDING.from) {
    const p = keyframe(elapsed, [
      [PASS.from, 0],
      [PASS.to, 1],
    ]);
    const shown = keyframe(elapsed, [
      [0, 0],
      [200, 1],
      [PASS.to - 300, 1],
      [PASS.to, 0],
    ]);

    return { x: lerp(lane.x, lane.x + lane.w - jetW, p), y: ground - SKIM, opacity: shown };
  }

  if (elapsed < LEAVE.from) {
    const p = keyframe(elapsed, [
      [LANDING.from, 0],
      [LANDING.to, 1],
    ]);
    const descent = Math.max(0, 1 - p / 0.45);
    const shown = keyframe(elapsed, [
      [LANDING.from, 0],
      [LANDING.from + 200, 1],
    ]);

    return { x: lerp(lane.x, stop, EASE.out(p)), y: ground - SKIM * descent * descent, opacity: shown };
  }

  const p = EASE.in(
    keyframe(elapsed, [
      [LEAVE.from, 0],
      [LEAVE.to, 1],
    ]),
  );

  return { x: lerp(stop, Math.min(stop + 360, lane.x + lane.w - jetW), p), y: ground, opacity: 1 - p };
}

/**
 * Returns the gold tag painted in the tarmac heart, upright so it reads.
 * @example
 * tagMarkup(300).querySelector('[data-slot="tag"]'); // the empty text the Gag fills
 */
function tagMarkup(width: number): SVGSVGElement {
  return svgMarkup(`<svg width="${width}" height="44" viewBox="0 0 ${width} 44">
    <text class="heart-tag" data-slot="tag" x="${width / 2}" y="32" text-anchor="middle"></text>
  </svg>`);
}

/**
 * Returns the orange carpet that rolls out from the jet's door, `length` pixels long.
 * @example
 * carpetMarkup(240).getAttribute('width'); // "240"
 */
function carpetMarkup(length: number): SVGSVGElement {
  const w = Math.max(40, Math.round(length));

  return svgMarkup(`<svg width="${w}" height="12" viewBox="0 0 ${w} 12">
    <rect class="carpet" x="0" y="2" width="${w}" height="8"/><rect class="carpet-edge" x="0" y="2" width="${w}" height="1.6"/>
  </svg>`);
}
