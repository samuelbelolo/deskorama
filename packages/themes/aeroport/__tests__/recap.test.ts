import type { Archetype, Rarity, Recap, RecapGroup } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { RECAP_SHOW_MS } from '../src/create-recap.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/**
 * Returns a recap group: `count` missed Events of one Role, the newest one labelled `label`.
 * @example
 * group('error', 'common', 2, 'CI en échec');
 */
function group(archetype: Archetype | null, rarity: Rarity, count: number, label: string): RecapGroup {
  const latest = { ...wallpaperEventFixture('fr', { id: label, archetype, rarity }), label };

  return { archetype, rarity, count, latest };
}

/** Two hours away: a milestone, five merges, two CI failures, a foreign mail, and four Events in Roles left out. */
const RECAP: Recap = {
  from: new Date(AFTERNOON - 2 * 3_600_000),
  to: new Date(AFTERNOON),
  total: 13,
  groups: [
    group('celebration', 'rare', 1, 'Cap des 1 000 pull requests mergées'),
    group('approval', 'notable', 5, 'Pull request mergée'),
    group('error', 'common', 2, 'CI en échec'),
    group(null, 'common', 1, 'E-mail reçu'),
  ],
  more: 4,
};

/**
 * Returns the tags of the suitcases on the belt, left to right.
 * @example
 * tags(layer); // ["Cap des 1 000 pull requests mergées", "5 validations", ...]
 */
function tags(layer: HTMLElement): string[] {
  return Array.from(layer.querySelectorAll('[data-part="recap-case"]'), (node) => node.textContent ?? '');
}

/**
 * Returns how many missed Events a suitcase tag counts: its number, or 1 for a single Event's own label.
 * @example
 * counted('5 validations'); // 5
 * counted('+ 4 autres'); // 4
 */
function counted(tag: string): number {
  const number = /^\+?\s*(\d+)\s/u.exec(tag);

  return number === null ? 1 : Number(number[1]);
}

describe("L'Aéroport's recap", () => {
  test('lists the missed Roles rarest first, under how long and how much was missed', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    mounted.host.sendRecap(RECAP);
    mounted.host.clock.advance(400);

    const { layer } = mounted;
    expect(layer.querySelector('[data-part="recap-title"]')?.textContent).toContain('Pendant ton absence');
    expect(layer.querySelector('[data-part="recap-note"]')?.textContent).toBe('2 h, 13 bagages');
    expect(tags(layer)).toEqual([
      'Cap des 1 000 pull requests mergées',
      '5 validations',
      '2 erreurs',
      'E-mail reçu',
      '+ 4 autres',
    ]);
  });

  test.each([
    ['with nothing in the way', []],
    ['behind the default windows', DEFAULT_WINDOWS],
  ] as const)('adds up to the total %s, folding what does not fit into the last suitcase', (_, frames) => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    mounted.host.setWindowFrames(frames);
    mounted.host.clock.advance(200);
    mounted.host.sendRecap(RECAP);

    const shown = tags(mounted.layer);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.reduce((sum, tag) => sum + counted(tag), 0)).toBe(RECAP.total);
    const belt = mounted.layer.querySelector<HTMLElement>('[data-part="recap"]');
    expect(belt).not.toBeNull();
  });

  test('stays readable in one look for its time, then goes and gives its room back', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    const before = host.largestFree({ skipHeld: true });
    host.sendRecap(RECAP);
    expect(host.largestFree({ skipHeld: true })).not.toEqual(before);
    host.clock.advance(RECAP_SHOW_MS - 600);
    expect(Number(layer.querySelector<HTMLElement>('[data-part="recap"]')?.style.opacity)).toBe(1);

    host.clock.advance(700);
    expect(layer.querySelector('[data-part="recap"]')).toBeNull();
    expect(host.largestFree({ skipHeld: true })).toEqual(before);
  });

  test('waits for room when the windows leave none, and shows once one moves away', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 860 }]);
    host.sendRecap(RECAP);
    expect(layer.querySelector('[data-part="recap"]')).toBeNull();

    host.setWindowFrames([]);
    expect(layer.querySelector('[data-part="recap"]')).not.toBeNull();
  });

  test('tags bad news in orange, a missed failed deploy included, and good news in ink', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    const failed = group('deploy', 'jackpot', 1, 'Mise en ligne ratée');
    const withFailure = {
      ...RECAP,
      groups: [
        { ...failed, latest: { ...failed.latest, meta: { ...failed.latest.meta, step: 'failed' as const } } },
        ...RECAP.groups,
      ],
      total: RECAP.total + 1,
    };
    mounted.host.sendRecap(withFailure);

    const news = Array.from(mounted.layer.querySelectorAll('.aeroport-recap-case--news'), (node) => node.textContent);
    expect(news).toEqual(['Mise en ligne ratée', '2 erreurs']);
  });

  test('a newer recap ends the wait of the one before it, and shows alone once room comes', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 860 }]);
    host.sendRecap(RECAP);
    host.clock.advance(2000);
    host.sendRecap({ ...RECAP, total: 14, more: 5 });
    host.clock.advance(6000);
    host.setWindowFrames([]);

    expect(layer.querySelectorAll('[data-part="recap"]')).toHaveLength(1);
    expect(layer.querySelector('[data-part="recap-note"]')?.textContent).toBe('2 h, 14 bagages');
  });

  test('holds still under reduced motion', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.sendRecap(RECAP);
    const rollers = mounted.layer.querySelector<HTMLElement>('.aeroport-recap-rollers');
    const still = rollers?.style.transform;
    mounted.host.clock.advance(2000);

    expect(rollers?.style.transform).toBe(still);
    expect(Number(mounted.layer.querySelector<HTMLElement>('[data-part="recap"]')?.style.opacity)).toBe(1);
  });
});
