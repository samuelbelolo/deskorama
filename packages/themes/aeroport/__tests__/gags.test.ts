import { ARCHETYPES, LANGUAGES, type Archetype, type Rect } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { CAPTION_HOLD_MS } from '../src/caption-room.ts';
import { boxOf } from './box-of.ts';
import { gagBoxes } from './gag-boxes.ts';
import { gagPoses } from './gag-poses.ts';
import { AFTERNOON } from './instants.ts';
import { intersects } from './intersects.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { playUntilGagEnds } from './play-until-gag-ends.ts';
import { roleEvent } from './role-event.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** The Roles with an everyday Gag of their own; the celebration and the deploy have their own scenes. */
const EVERYDAY = ARCHETYPES.filter((role) => role !== 'celebration' && role !== 'deploy');

/** Each everyday Role in each display language. */
const CASES = EVERYDAY.flatMap((role) => LANGUAGES.map((lang) => [role, lang] as const));

/** Window layouts that leave the scene only partly visible, each with ground and sky somewhere. */
const LAYOUTS: Record<string, readonly Rect[]> = {
  'no window': [],
  'the left half covered': [{ x: 0, y: 0, w: 720, h: 900 }],
  'the top covered': [{ x: 0, y: 0, w: 1440, h: 420 }],
  'the right third covered': [{ x: 960, y: 0, w: 480, h: 900 }],
};

/** Long painted words, to check that props as wide as a tag can be still fit their room. */
const LONG_TAG = 'TWELVE CHARS';

/**
 * Returns the Gag's boxes that leave visible space or touch the signs, for a failure message.
 * @example
 * misplaced(mounted, signs); // [] when everything is in place
 */
function misplaced(airport: MountedAirport, signs: Rect | null): Rect[] {
  return gagBoxes(airport.layer).filter(
    (box) => airport.host.visibleFraction(box) < 1 || (signs !== null && intersects(box, signs)),
  );
}

describe("L'Aéroport's everyday Gags", () => {
  test.each(CASES)('%s in %s shows its Caption, fact then detail, in the display language', (role, lang) => {
    mounted = mountAirport({ lang, start: AFTERNOON });
    const event = roleEvent(lang, role);
    mounted.host.send(event);

    const caption = mounted.layer.querySelector('[data-part="caption"]')?.textContent ?? '';
    expect(caption.indexOf(event.label)).toBeGreaterThan(0);
    expect(caption.indexOf(event.label)).toBeLessThan(caption.indexOf(event.meta.detail));
    expect(mounted.layer.querySelector('[data-part="freight"]')).toBeNull();
  });

  test.each(CASES)('%s in %s holds its Caption about 2.5 s after the Gag ends, then clears it', (role, lang) => {
    mounted = mountAirport({ lang, start: AFTERNOON });
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
      mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
      const { host, layer } = mounted;
      host.setWindowFrames(frames);
      host.clock.advance(200);
      const signs = boxOf(layer, '[data-part="signs"]');
      host.send(roleEvent('fr', role, LONG_TAG));

      let elapsed = 0;
      while (layer.querySelector('[data-gag]') !== null && elapsed < 12_000) {
        expect(misplaced(mounted, signs), `${role} at ${elapsed} ms`).toEqual([]);
        host.clock.advance(250);
        elapsed += 250;
      }
      expect(elapsed, `${role} never played`).toBeGreaterThan(0);
    });
  });

  test.each(EVERYDAY)('%s holds a still key pose under reduced motion', (role) => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    host.send(roleEvent('en', role));

    const first = gagPoses(layer);
    host.clock.advance(1500);

    expect(first.length).toBeGreaterThan(0);
    expect(gagPoses(layer)).toEqual(first);
    expect(first.some((entry) => !entry.endsWith(' 0.000'))).toBe(true);
  });

  test.each(EVERYDAY)('%s moves when motion is allowed', (role) => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(roleEvent('en', role));

    const first = gagPoses(layer);
    host.clock.advance(1500);

    expect(gagPoses(layer)).not.toEqual(first);
  });

  test('a like draws a thumb, never the stamp of an approval', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    mounted.host.send(roleEvent('en', 'like', 'LGTM'));

    expect(mounted.layer.querySelector('[data-part="thumb-balloon"]')?.textContent?.trim()).toBe('LGTM');
    expect(mounted.layer.querySelector('[data-part="stamp"]')).toBeNull();
  });

  test('a departure flies the tag away on a plane, with no one carrying a box', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    mounted.host.send(roleEvent('fr', 'departure', 'BRANCHE'));

    expect(mounted.layer.querySelector('[data-part="departing-cub"]')?.textContent?.trim()).toBe('BRANCHE');
  });

  test('the partner greets the crew in French on the French scene, and never as its captain', () => {
    for (const lang of LANGUAGES) {
      mounted = mountAirport({ lang, start: AFTERNOON });
      mounted.host.send(roleEvent(lang, 'partner'));
      mounted.host.clock.advance(2600);
      const said = mounted.layer.querySelector('[data-part="bubble"]')?.textContent ?? '';
      expect(said).not.toBe('');
      expect(said).not.toMatch(/commandant|captain/i);
      mounted.unmount();
      mounted = undefined;
    }
  });

  test('a message carries its own words over the radio, then the ground answers', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    const event = roleEvent('fr', 'message');
    mounted.host.send(event);
    mounted.host.clock.advance(2200);

    const bubbles = Array.from(mounted.layer.querySelectorAll<HTMLElement>('[data-part="bubble"]'));
    const shown = bubbles.filter((bubble) => Number(bubble.style.opacity) > 0).map((bubble) => bubble.textContent);
    expect(shown).toEqual([event.meta.detail]);
    mounted.host.clock.advance(1600);
    const answered = bubbles.filter((bubble) => Number(bubble.style.opacity) > 0).map((bubble) => bubble.textContent);
    expect(answered).toEqual(['Bien reçu.']);
  });

  test('a Gag that finds no room waits, then plays once a window moves away', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.send(roleEvent('en', 'money', '+49 €'));
    host.clock.advance(1000);
    expect(layer.querySelector('[data-gag]')).toBeNull();

    host.setWindowFrames([]);
    host.clock.advance(600);
    expect(layer.querySelector('[data-part="cash-van"]')).not.toBeNull();
  });
});
