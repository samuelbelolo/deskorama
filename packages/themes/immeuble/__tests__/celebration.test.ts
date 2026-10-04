import { ARCHETYPES, LANGUAGES, type Archetype } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { plainText } from '../src/plain-text.ts';
import { canvasPrint } from './canvas-print.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { gagBoxes } from './gag-boxes.ts';
import { AFTERNOON } from './instants.ts';
import { milestone } from './milestone.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { playUntilGagEnds } from './play-until-gag-ends.ts';
import { roleEvent } from './role-event.ts';
import { unionArea } from './union-area.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** The Roles of the everyday Gags, played as notable Events. */
const NOTABLES = ARCHETYPES.filter((role) => role !== 'celebration' && role !== 'deploy');

/**
 * Returns the area a Gag holds at its key pose behind the default windows, held still with reduced motion.
 * @example
 * heldArea('approval'); // 28800
 */
function heldArea(role: Archetype): number {
  const building = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
  building.host.setWindowFrames(DEFAULT_WINDOWS);
  const event = role === 'celebration' ? milestone('fr') : { ...roleEvent('fr', role), rarity: 'notable' as const };
  building.host.send(event);
  building.host.clock.advance(100);

  const area = unionArea(gagBoxes(building.layer, false));
  building.unmount();
  document.body.replaceChildren();

  return area;
}

describe("L'Immeuble's celebration", () => {
  test.each(LANGUAGES)('sets off fireworks round a gold trophy, with its plaque, in %s', (lang) => {
    mounted = mountBuilding({ lang, start: AFTERNOON });
    const event = milestone(lang);
    mounted.host.send(event);
    mounted.host.clock.advance(2600);

    const { layer } = mounted;
    expect(layer.querySelector('[data-gag="celebration"]')?.getAttribute('data-prop')).toBe('trophy');
    expect(layer.querySelectorAll('[data-gag="celebration"][data-prop="burst"]').length).toBeGreaterThan(0);
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe(plainText(event.label));
    expect(layer.querySelector('[data-part="caption-detail"]')?.textContent?.trim()).toBe(plainText(event.meta.detail));
  });

  test('outranks every notable Gag behind the default windows: it holds more of the screen than any of them', () => {
    const celebration = heldArea('celebration');
    const notables = NOTABLES.map((role) => heldArea(role));

    expect(celebration).toBeGreaterThan(Math.max(...notables));
  });

  test('keeps notable Gags waiting while it plays, and lets them play once it ends', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    host.send(milestone('en'));
    host.send({ ...roleEvent('en', 'approval'), rarity: 'notable' });
    host.clock.advance(1000);

    expect(layer.querySelector('[data-gag="approval"]')).toBeNull();
    expect(layer.querySelector('[data-gag="celebration"]')).not.toBeNull();

    playUntilGagEnds(host, layer, 9000);
    host.clock.advance(1600);
    expect(layer.querySelector('[data-gag="approval"]')).not.toBeNull();
  });

  test('lights the whole building up, the empty flats included, even behind the windows', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    host.setGauges({ crowd: 2 });
    host.clock.advance(100);
    const before = canvasPrint(layer, { x: 0, y: 75, w: 360, h: 90 });

    host.send(milestone('fr'));
    host.clock.advance(400);

    expect(canvasPrint(layer, { x: 0, y: 75, w: 360, h: 90 })).not.toBe(before);
  });

  test('holds a still key pose under reduced motion, and moves otherwise', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.send(milestone('en'));
    mounted.host.clock.advance(100);
    const still = canvasPrint(mounted.layer, { x: 0, y: 0, w: 360, h: 75 });
    mounted.host.clock.advance(900);
    expect(canvasPrint(mounted.layer, { x: 0, y: 0, w: 360, h: 75 })).toBe(still);
    mounted.unmount();

    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    mounted.host.send(milestone('en'));
    mounted.host.clock.advance(600);
    const first = canvasPrint(mounted.layer, { x: 0, y: 0, w: 360, h: 75 });
    mounted.host.clock.advance(900);
    expect(canvasPrint(mounted.layer, { x: 0, y: 0, w: 360, h: 75 })).not.toBe(first);
  });
});
