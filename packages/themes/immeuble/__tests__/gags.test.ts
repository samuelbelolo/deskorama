import { ARCHETYPES, LANGUAGES, type Archetype, type Rect } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { plainText } from '../src/plain-text.ts';
import { CAPTION_HOLD_MS } from '../src/timing.ts';
import { canvasPrint } from './canvas-print.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { gagBoxes } from './gag-boxes.ts';
import { genericEvent } from './generic-event.ts';
import { AFTERNOON } from './instants.ts';
import { intersects } from './intersects.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { playUntilGagEnds } from './play-until-gag-ends.ts';
import { roleEvent } from './role-event.ts';
import { signBoxes } from './sign-boxes.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** The Roles with an everyday Gag of their own; the celebration and the deploy get their own scenes. */
const EVERYDAY = ARCHETYPES.filter((role) => role !== 'celebration' && role !== 'deploy');

/** Each everyday Role in each display language. */
const CASES = EVERYDAY.flatMap((role) => LANGUAGES.map((lang) => [role, lang] as const));

/** Window layouts that leave the scene only partly visible. */
const LAYOUTS: Record<string, readonly Rect[]> = {
  'no window': [],
  'the default windows': DEFAULT_WINDOWS,
  'the left half covered': [{ x: 0, y: 0, w: 720, h: 900 }],
  'the top covered': [{ x: 0, y: 0, w: 1440, h: 420 }],
  'the right third covered': [{ x: 960, y: 0, w: 480, h: 900 }],
};

/** A long tag, to check that props as wide as a tag can be still fit their room. */
const LONG_TAG = 'TWELVE CHARS';

/**
 * Returns the Gags' boxes that leave visible space or touch a sign, for a failure message.
 * @example
 * misplaced(mounted); // [] when everything is in place
 */
function misplaced(building: MountedBuilding): Rect[] {
  const signs = signBoxes(building.layer);

  return gagBoxes(building.layer).filter(
    (box) => building.host.visibleFraction(box) < 1 || signs.some((sign) => intersects(box, sign)),
  );
}

describe("L'Immeuble's everyday Gags", () => {
  test.each(CASES)('%s in %s hangs its plaque, fact then detail, in the display language', (role, lang) => {
    mounted = mountBuilding({ lang, start: AFTERNOON });
    const event = roleEvent(lang, role);
    mounted.host.send(event);

    const caption = mounted.layer.querySelector('[data-part="caption"]');
    expect(caption?.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe(plainText(event.label));
    expect(caption?.querySelector('[data-part="caption-detail"]')?.textContent?.trim()).toBe(
      plainText(event.meta.detail),
    );
    expect(caption?.textContent?.indexOf(plainText(event.label))).toBeLessThan(
      caption?.textContent?.indexOf(plainText(event.meta.detail)) ?? 0,
    );
  });

  test.each(CASES)('%s in %s keeps its plaque about 2.5 s after the Gag ends, then takes it down', (role, lang) => {
    mounted = mountBuilding({ lang, start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(roleEvent(lang, role));

    playUntilGagEnds(host, layer);
    expect(layer.querySelector('[data-gag]')).toBeNull();
    host.clock.advance(CAPTION_HOLD_MS - 200);
    expect(layer.querySelector('[data-part="caption"]')).not.toBeNull();
    host.clock.advance(200);
    expect(layer.querySelector('[data-part="caption"]')).toBeNull();
  });

  describe.each(Object.entries(LAYOUTS))('with %s', (_, frames) => {
    test.each(EVERYDAY)('%s plays inside visible space, off the signs, from start to end', (role: Archetype) => {
      mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
      const { host, layer } = mounted;
      host.setWindowFrames(frames);
      host.clock.advance(200);
      host.send(roleEvent('fr', role, LONG_TAG));

      let elapsed = 0;
      while (layer.querySelector('[data-gag]') !== null && elapsed < 12_000) {
        expect(misplaced(mounted), `${role} at ${elapsed} ms`).toEqual([]);
        host.clock.advance(250);
        elapsed += 250;
      }
      expect(elapsed, `${role} never played`).toBeGreaterThan(0);
    });
  });

  test.each(EVERYDAY)('%s holds a still key pose under reduced motion', (role) => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    host.send(roleEvent('en', role));
    host.clock.advance(100);

    const first = canvasPrint(layer);
    host.clock.advance(1500);

    expect(layer.querySelector('[data-gag]')).not.toBeNull();
    expect(canvasPrint(layer)).toBe(first);
  });

  test.each(EVERYDAY)('%s moves when motion is allowed', (role) => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(roleEvent('en', role));
    host.clock.advance(100);

    const first = canvasPrint(layer);
    host.clock.advance(800);

    expect(canvasPrint(layer)).not.toBe(first);
  });

  test('a Gag that finds no room waits, then plays once a window moves away', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.send(roleEvent('en', 'money', '+49 €'));
    host.clock.advance(1000);
    expect(layer.querySelector('[data-gag]')).toBeNull();

    host.setWindowFrames([]);
    expect(layer.querySelector('[data-gag="money"]')).not.toBeNull();
  });

  test('Gags play side by side, each in its own room, their plaques apart', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    for (const role of ['approval', 'money', 'rejection', 'arrival'] as const) host.send(roleEvent('fr', role));

    const boxes = gagBoxes(layer);
    expect(layer.querySelectorAll('[data-gag]')).toHaveLength(4);
    for (const [i, a] of boxes.entries()) for (const b of boxes.slice(i + 1)) expect(intersects(a, b)).toBe(false);
  });

  test('a like always draws a thumb up, never the stamp of an approval', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(roleEvent('en', 'like', 'LGTM'));
    host.send(roleEvent('en', 'like', '+1'));

    const props = Array.from(layer.querySelectorAll('[data-gag="like"]'), (gag) => gag.getAttribute('data-prop'));
    expect(props).toEqual(['thumb', 'thumb']);
    expect(layer.querySelector('[data-prop="stamp"]')).toBeNull();
  });

  test('only an approval brings the stamp', () => {
    for (const role of EVERYDAY) {
      mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
      mounted.host.send(roleEvent('fr', role));
      const prop = mounted.layer.querySelector('[data-gag]')?.getAttribute('data-prop');
      expect({ role, stamp: prop === 'stamp' }).toEqual({ role, stamp: role === 'approval' });
      mounted.unmount();
      mounted = undefined;
    }
  });

  test('a rejection takes turns between the thumb down and the red cross', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    mounted.host.send(roleEvent('fr', 'rejection', 'NON'));
    mounted.host.send(roleEvent('fr', 'rejection', 'NON'));

    const props = Array.from(mounted.layer.querySelectorAll('[data-gag="rejection"]'), (gag) =>
      gag.getAttribute('data-prop'),
    );
    expect(props).toEqual(['thumb-down', 'cross']);
  });

  test('a departure rubs the figure out, with no one carrying a box', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    mounted.host.send(roleEvent('fr', 'departure', 'BRANCHE'));

    expect(mounted.layer.querySelector('[data-gag="departure"]')?.getAttribute('data-prop')).toBe('eraser');
  });

  test.each(Object.entries(LAYOUTS))('with %s, an intruder’s plaque never covers the tally it raises', (_, frames) => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(frames);
    host.send(roleEvent('fr', 'blocked', 'SPAM'));
    host.send(roleEvent('fr', 'blocked', 'BOT'));

    const hall = signBoxes(layer)[2];
    if (hall === undefined) throw new Error('The hall tally is not shown.');
    for (const box of gagBoxes(layer)) expect(intersects(box, hall)).toBe(false);
  });

  test('errors in a burst get worse each time, and louder', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    for (const id of ['a', 'b', 'c']) host.send({ ...roleEvent('fr', 'error'), id: `error-${id}` });

    const props = Array.from(layer.querySelectorAll('[data-gag="error"]'), (gag) => gag.getAttribute('data-prop'));
    const sounds = Array.from(layer.querySelectorAll('[data-part="caption-sound"]'), (sound) =>
      sound.textContent?.trim(),
    );
    expect(props).toEqual(['red-screen-1', 'red-screen-2', 'red-screen-3']);
    expect(sounds).toEqual(['BIP !', 'BZZT !', 'AÏE !']);
  });

  test.each(['celebration', 'deploy'] as const)(
    'a %s is delivered with its plaque until its own scene comes',
    (role) => {
      mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
      const event = roleEvent('en', role);
      mounted.host.send(event);

      expect(mounted.layer.querySelector(`[data-gag="${role}"]`)?.getAttribute('data-prop')).toBe('parcel');
      expect(mounted.layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe(
        plainText(event.label),
      );
    },
  );

  describe.each(
    LANGUAGES.flatMap((lang) => (['foreign', 'undescribed'] as const).map((shape) => [shape, lang] as const)),
  )('the generic Gag for a %s Event in %s', (shape, lang) => {
    test('delivers a parcel and hangs the plaque, fact then detail', () => {
      mounted = mountBuilding({ lang, start: AFTERNOON });
      const event = genericEvent(lang, shape);
      mounted.host.send(event);

      expect(mounted.layer.querySelector('[data-gag="other"]')?.getAttribute('data-prop')).toBe('parcel');
      expect(mounted.layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe(
        plainText(event.label),
      );
      expect(mounted.layer.querySelector('[data-part="caption-detail"]')?.textContent?.trim()).toBe(
        plainText(event.meta.detail),
      );
    });

    test.each(Object.entries(LAYOUTS))(
      'stays inside visible space, off the signs, with %s, and keeps its plaque 2.5 s',
      (_, frames) => {
        mounted = mountBuilding({ lang, start: AFTERNOON });
        const { host, layer } = mounted;
        host.setWindowFrames(frames);
        host.send(genericEvent(lang, shape));

        let elapsed = 0;
        while (layer.querySelector('[data-gag]') !== null && elapsed < 12_000) {
          expect(misplaced(mounted)).toEqual([]);
          host.clock.advance(250);
          elapsed += 250;
        }
        expect(elapsed).toBeGreaterThan(0);
        host.clock.advance(CAPTION_HOLD_MS - 300);
        expect(layer.querySelector('[data-part="caption"]')).not.toBeNull();
      },
    );
  });

  test.each(LANGUAGES)('behind the default windows, every plaque in %s keeps its detail', (lang) => {
    const dropped: string[] = [];
    for (const role of EVERYDAY) {
      mounted = mountBuilding({ lang, start: AFTERNOON });
      mounted.host.setWindowFrames(DEFAULT_WINDOWS);
      mounted.host.send(roleEvent(lang, role, 'TAG'));
      if (mounted.layer.querySelector('[data-part="caption-detail"]') === null) dropped.push(role);
      mounted.unmount();
      mounted = undefined;
    }

    expect(dropped).toEqual([]);
  });
});
