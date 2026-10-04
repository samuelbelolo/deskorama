import type { WallpaperEvent } from '@deskorama/core';
import { fillSlot } from './fill-slot.ts';
import type { RoomRequest } from './find-room.ts';
import { CRATE_TOP_CENTRE, FREIGHT, freightMarkup } from './freight-markup.ts';
import { freightPose } from './freight-pose.ts';
import { DRIVE_MS, GENERIC_GAG_MS, STOP_MS } from './freight-timing.ts';
import { poseSprite } from './pose-sprite.ts';
import { rarityScale } from './rarity-scale.ts';
import { scriptedGag } from './scripted-gag.ts';
import { createSprite } from './create-sprite.ts';
import type { Gag } from './stage.ts';
import { svgMarkup } from './svg-markup.ts';

/** How far the tug drives each side of its stop, tried longest first when room is short. */
const TRAVELS = [240, 110, 60, 0] as const;

/**
 * Plays the generic Gag: a baggage tug brings a crate stencilled with the Source's name, stops, and drives off. A "?"
 * sticker marks a kind nobody described; rarer Events get a bigger crate. On the ground near the freight stand
 * first, else anywhere visible, each time with the longest drive that fits. Key pose: the tug stopped.
 * @example
 * const stop = playGenericGag(stage, event, () => console.log('next Event'));
 */
export const playGenericGag: Gag = scriptedGag({
  duration: GENERIC_GAG_MS,
  keyPose: DRIVE_MS + STOP_MS / 2,
  room: (stage, event) => {
    const scale = rarityScale(event.rarity);
    const near = { x: stage.layout.width * 0.3, y: stage.layout.freightLine };

    return (['ground', 'anywhere'] as const).flatMap((band) =>
      TRAVELS.map((travel): RoomRequest => ({
        w: FREIGHT.w * scale + 2 * travel,
        h: FREIGHT.h * scale,
        bands: [band],
        near,
      })),
    );
  },
  build(_stage, event, room, layer) {
    const scale = rarityScale(event.rarity);
    const width = FREIGHT.w * scale;
    const travel = Math.max(0, (room.spot.w - width) / 2);
    const stop = room.spot.x + travel;
    const path = { enter: stop + travel, stop, exit: stop - travel };
    const y = room.floor - FREIGHT.h * scale;

    const tug = createSprite(layer, svgMarkup(freightMarkup(!event.recognised)), 'freight');
    fillSlot(tug, 'crate', crateWord(event));

    return {
      captionX: stop + CRATE_TOP_CENTRE.x * scale,
      draw(elapsed) {
        const pose = freightPose(elapsed, path);
        poseSprite(tug, { x: pose.x, y, scaleX: scale, scaleY: scale, opacity: pose.opacity });
      },
    };
  },
});

/**
 * Returns what the crate's stencil says: the Source's name, in capitals, cut to the crate.
 * @example
 * crateWord(event); // "TRAMLO"
 */
function crateWord(event: WallpaperEvent): string {
  return event.source.toUpperCase().slice(0, 10);
}
