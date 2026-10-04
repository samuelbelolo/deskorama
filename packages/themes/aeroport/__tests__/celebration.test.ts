import { ARCHETYPES, LANGUAGES, type Archetype } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { gagPoses } from './gag-poses.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { playUntilGagEnds } from './play-until-gag-ends.ts';
import { unionBox } from './union-box.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** The Roles a Gag plays for, besides the celebration and the deploy's own scenes. */
const OTHERS = ARCHETYPES.filter((role) => role !== 'celebration' && role !== 'deploy');

/**
 * Returns a milestone as a Theme receives it, in one display language.
 * @example
 * milestone('fr').meta.tag; // "1 000"
 */
function milestone(lang: 'fr' | 'en'): ReturnType<typeof wallpaperEventFixture> {
  return wallpaperEventFixture(lang, {
    id: 'milestone',
    archetype: 'celebration',
    rarity: 'rare',
    text: {
      fr: { label: 'Cap des 1 000 pull requests mergées', detail: 'Depuis la création du dépôt', tag: '1 000' },
      en: { label: '1,000 pull requests merged', detail: 'Since the repository was created', tag: '1,000' },
    },
  });
}

/** What a Gag shows at its key pose: the area of everything it draws, and the width of its widest actor. */
interface KeyPose {
  readonly area: number;
  readonly widest: number;
}

/**
 * Returns what a Gag shows at its key pose, held still with reduced motion, behind the default windows.
 * @example
 * keyPose('approval'); // { area: 36000, widest: 190 }
 */
function keyPose(role: Archetype): KeyPose {
  const airport = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
  airport.host.setWindowFrames(DEFAULT_WINDOWS);
  airport.host.clock.advance(200);
  const event =
    role === 'celebration'
      ? milestone('fr')
      : wallpaperEventFixture('fr', { id: role, archetype: role, rarity: 'notable' });
  airport.host.send(event);
  airport.host.clock.advance(100);

  const box = unionBox(airport.layer);
  const actors = Array.from(airport.layer.querySelectorAll<HTMLElement>('[data-gag] > svg'));
  const widest = Math.max(0, ...actors.map((art) => art.getBoundingClientRect().width));
  airport.unmount();
  document.body.replaceChildren();

  return { area: box === null ? 0 : box.w * box.h, widest };
}

describe("L'Aéroport's celebration", () => {
  test.each(LANGUAGES)('draws a gold heart in the sky with the golden jet, and its Caption, in %s', (lang) => {
    mounted = mountAirport({ lang, start: AFTERNOON });
    const event = milestone(lang);
    mounted.host.send(event);
    mounted.host.clock.advance(3200);

    const { layer } = mounted;
    expect(layer.querySelector('[data-part="golden-jet"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="gold-heart"]')?.textContent?.trim()).toBe(event.meta.tag);
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent).toBe(event.label);
    expect(layer.querySelector('[data-part="freight"]')).toBeNull();
  });

  test('lands on the runway, its heart painted on the tarmac, when windows hide the sky', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    mounted.host.setWindowFrames(DEFAULT_WINDOWS);
    mounted.host.clock.advance(200);
    mounted.host.send(milestone('en'));
    mounted.host.clock.advance(6000);

    const { layer } = mounted;
    expect(layer.querySelector('[data-part="golden-jet"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="tarmac-heart"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="heart-tag"]')?.textContent?.trim()).toBe('1,000');
    expect(layer.querySelector('[data-part="carpet"]')).not.toBeNull();
  });

  test('is clearly bigger than any notable Gag, behind the default windows', () => {
    const celebration = keyPose('celebration');
    const others = OTHERS.map((role) => keyPose(role));

    expect(celebration.widest).toBeGreaterThan(1.5 * Math.max(...others.map((pose) => pose.widest)));
    expect(celebration.area).toBeGreaterThan(Math.max(...others.map((pose) => pose.area)));
  });

  test('holds a still key pose under reduced motion, and moves otherwise', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.send(milestone('en'));
    const still = gagPoses(mounted.layer);
    mounted.host.clock.advance(1500);
    expect(gagPoses(mounted.layer)).toEqual(still);
    mounted.unmount();

    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    mounted.host.send(milestone('en'));
    const first = gagPoses(mounted.layer);
    mounted.host.clock.advance(1500);
    expect(gagPoses(mounted.layer)).not.toEqual(first);
  });

  test('waits for room rather than playing small, and plays once the windows move away', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.send(milestone('en'));
    host.clock.advance(15_000);
    expect(layer.querySelector('[data-part="golden-jet"]')).toBeNull();

    host.setWindowFrames([]);
    host.clock.advance(600);
    expect(layer.querySelector('[data-part="golden-jet"]')).not.toBeNull();
    expect(playUntilGagEnds(host, layer)).toBeLessThan(12_000);
  });
});
