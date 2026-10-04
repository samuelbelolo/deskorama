import type { Rect } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { CAPTION_HOLD_MS } from '../src/caption-room.ts';
import { GENERIC_GAG_MS } from '../src/freight-timing.ts';
import { ROOM_RETRY_MS, ROOM_WAIT_MS } from '../src/wait-for-room.ts';
import { boxOf } from './box-of.ts';
import { intersects } from './intersects.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** Instants of the generic Gag to check, from the tug's entry to the end of the Caption's hold. */
const INSTANTS = [0, 200, 600, 1300, 2400, 3500, 4300, GENERIC_GAG_MS - 50];

/** Window layouts that leave room only in some corner of the screen. */
const LAYOUTS: Record<string, readonly Rect[]> = {
  'the right half': [{ x: 0, y: 0, w: 720, h: 900 }],
  'the sky over the right': [
    { x: 0, y: 0, w: 720, h: 900 },
    { x: 720, y: 560, w: 720, h: 340 },
  ],
  'the bottom left, beside the signs': [
    { x: 0, y: 0, w: 1440, h: 540 },
    { x: 720, y: 540, w: 720, h: 360 },
  ],
};

/**
 * Returns the boxes the generic Gag draws right now: the tug and, once shown, the Caption.
 * @example
 * gagBoxes(layer); // [{ x: 400, y: 680, ... }, { x: 380, y: 560, ... }]
 */
function gagBoxes(layer: HTMLElement): Rect[] {
  return ['[data-part="freight"] svg', '[data-part="caption"]'].flatMap((selector) => boxOf(layer, selector) ?? []);
}

describe("L'Aéroport's generic Gag", () => {
  test.each(Object.entries(LAYOUTS))(
    'stays inside visible space and off the signs, with room left in %s',
    (_, frames) => {
      mounted = mountAirport({ lang: 'en' });
      const { layer, host } = mounted;
      host.setWindowFrames(frames);
      const signs = boxOf(layer, '[data-part="signs"]');
      host.send(wallpaperEventFixture('en', { rarity: 'rare', archetype: null, recognised: false }));
      let elapsed = 0;
      for (const instant of INSTANTS) {
        host.clock.advance(instant - elapsed);
        elapsed = instant;
        for (const box of gagBoxes(layer)) {
          expect(host.visibleFraction(box), `at ${instant} ms`).toBe(1);
          expect(signs !== null && intersects(box, signs), `at ${instant} ms`).toBe(false);
        }
      }
      expect(boxOf(layer, '[data-part="caption"]')).not.toBeNull();
    },
  );

  test('holds its room until its Caption is gone, so nothing else lands there', () => {
    mounted = mountAirport({ lang: 'en' });
    const { layer, host } = mounted;
    host.send(wallpaperEventFixture('en', { archetype: null }));
    const caption = boxOf(layer, '[data-part="caption"]');
    if (caption === null) throw new Error('The Caption is not shown.');
    const near = { x: caption.x + caption.w / 2, y: caption.y + caption.h / 2 };
    const during = host.freeSpot({ w: 60, h: 60, near });
    expect(during !== null && intersects(during, caption)).toBe(false);
    host.clock.advance(GENERIC_GAG_MS + CAPTION_HOLD_MS);
    const after = host.freeSpot({ w: 60, h: 60, near });
    expect(after !== null && intersects(after, caption)).toBe(true);
  });

  test('waits for room when windows cover the scene, and plays once they move away', () => {
    mounted = mountAirport({ lang: 'en' });
    const { layer, host } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.send(wallpaperEventFixture('en', { archetype: null }));
    host.clock.advance(ROOM_RETRY_MS * 3);
    expect(layer.querySelector('[data-part="freight"]')).toBeNull();
    host.setWindowFrames([]);
    host.clock.advance(ROOM_RETRY_MS);
    expect(layer.querySelector('[data-part="freight"]')).not.toBeNull();
  });

  test('gives up after waiting a while, and plays the next Event when room comes back', () => {
    mounted = mountAirport({ lang: 'en' });
    const { layer, host } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.send(wallpaperEventFixture('en', { id: 'lost', archetype: null }));
    host.send(wallpaperEventFixture('en', { id: 'next', source: 'Mail', archetype: null }));
    host.clock.advance(ROOM_WAIT_MS);
    host.setWindowFrames([]);
    host.clock.advance(ROOM_RETRY_MS);
    expect(layer.querySelector('[data-part="caption-source"]')?.textContent).toBe('Mail');
  });
});
