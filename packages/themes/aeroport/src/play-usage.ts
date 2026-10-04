import type { WallpaperEvent } from '@deskorama/core';
import { bannerPlaneMarkup } from './banner-plane-markup.ts';
import { fillSlot } from './fill-slot.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { lifeOpacity } from './life-opacity.ts';
import { poseSprite } from './pose-sprite.ts';
import { scriptedGag } from './scripted-gag.ts';
import { shortenLabel } from './shorten-label.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import type { Strings } from './strings.ts';
import { svgMarkup } from './svg-markup.ts';

const DURATION = 5400;

/** The banner plane's height, plus the bob of its flight. */
const PLANE_HEIGHT = 34;
const BOB = 3;

/** How far the plane flies across its room, at least, and the shorter lane it makes do with when room is short. */
const LANE = 300;
const SHORT_LANE = 160;

/**
 * usage: the product gets used. A Cub tows a banner painted with the tag ("+3", "CSV") slowly across a lane of
 * visible sky, else low over the ground. Key pose: the banner in the middle of its lane.
 * @example
 * director.play(usageEvent); // through gagFor(event) === playUsage
 */
export const playUsage: Gag = scriptedGag({
  duration: DURATION,
  keyPose: 2700,
  room: (stage, event) =>
    [LANE, SHORT_LANE].map((lane) => ({
      w: bannerPlaneMarkup(bannerWord(event, stage.text).length).width + lane,
      h: PLANE_HEIGHT + BOB * 2,
      bands: [stage.layout.skyBand, 'ground'],
      near: { x: stage.layout.width * 0.3, y: stage.layout.horizon * 0.45 },
    })),
  build({ text }, event, room, layer) {
    const { spot, top } = room;
    const word = bannerWord(event, text);
    const art = bannerPlaneMarkup(word.length);
    const plane = createSprite(layer, svgMarkup(art.markup), 'banner-plane');
    fillSlot(plane, 'tag', word);

    return {
      captionX: spot.x + spot.w / 2,
      draw(elapsed) {
        const across = keyframe(elapsed, [
          [0, 0],
          [DURATION, 1],
        ]);
        const x = lerp(spot.x, spot.x + spot.w - art.width, across);
        poseSprite(plane, {
          x,
          y: top + BOB + Math.sin(across * Math.PI * 3) * BOB,
          opacity: lifeOpacity(elapsed, DURATION),
        });
      },
    };
  },
});

/** The longest banner a Cub tows, in characters, so a long label never asks for room wider than a screen. */
const BANNER_CHARS = 24;

/**
 * Returns what the banner says: the tag as the Event wrote it, else the label in capitals, cut at a word to fit.
 * @example
 * bannerWord(commitsPushed, textFor('en')); // "+3"
 * bannerWord(reportExported, textFor('en')); // "REPORT EXPORTED"
 */
function bannerWord(event: WallpaperEvent, text: Strings): string {
  const tag = event.meta.tag.trim();
  const word = tag === '' ? event.label.toUpperCase() : tag;

  return shortenLabel(word, BANNER_CHARS, text.board);
}
