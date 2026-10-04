import type { WallpaperEvent } from '@deskorama/core';
import { FAKE_SCREEN } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { PAL } from '../src/palette.ts';
import { boxOf } from './box-of.ts';
import { canvasPrint } from './canvas-print.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { AFTERNOON, NIGHT } from './instants.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { pixelAt } from './pixel-at.ts';
import { roleEvent } from './role-event.ts';
import { rootOf } from './root-of.ts';
import { signText } from './sign-text.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

describe("L'Immeuble's scene", () => {
  test('follows the hour: a blue sky in the afternoon, a night sky at 3:00', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    expect(pixelAt(mounted.layer, 2, 2)).toBe(PAL.sky);
    mounted.unmount();

    mounted = mountBuilding({ start: NIGHT });
    expect(pixelAt(mounted.layer, 2, 2)).toBe(PAL.night);
  });

  test('moves on with the Clock, into the night', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    mounted.host.clock.advance(9 * 3_600_000);

    expect(pixelAt(mounted.layer, 2, 2)).toBe(PAL.night);
  });

  test('lights one room per person active, the rooms you can see in an honest share', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    const { host, layer } = mounted;
    const root = rootOf(layer);

    host.setGauges({ crowd: 9 });
    expect(root.dataset['tenants']).toBe('9');

    host.setGauges({ crowd: 0 });
    expect(root.dataset['tenants']).toBe('0');

    host.setGauges({ crowd: 60 });
    expect(root.dataset['tenants']).toBe('29');
  });

  test('behind windows, the lit share of the rooms in view still follows the crowd', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    const { host, layer } = mounted;
    const root = rootOf(layer);
    host.setWindowFrames(DEFAULT_WINDOWS);

    host.setGauges({ crowd: 2 });
    const quiet = Number(root.dataset['tenantsInView']);
    host.setGauges({ crowd: 14 });
    const busy = Number(root.dataset['tenantsInView']);

    expect(quiet).toBeGreaterThanOrEqual(1);
    expect(busy).toBeGreaterThan(quiet);
    expect(root.dataset['tenants']).toBe('14');
  });

  test('shows the Gauges with the Source’s own words, and follows them', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setGauges({ crowd: 9, daily: 23, total: 1234 });

    expect(signText(layer, 'board')).toBe('SUR TRAMLO ACTIFS 9 COMMITS 23');
    expect(signText(layer, 'poster')).toBe('ISSUES TRAMLO 1\u00a0234');
    expect(signText(layer, 'hall')).toBe('INTRUS BLOQUÉS 0');

    host.setGauges({ daily: 24 });
    expect(signText(layer, 'board')).toBe('SUR TRAMLO ACTIFS 9 COMMITS 24');
  });

  test('keeps every sign free of Gags', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    const { host, layer } = mounted;

    for (const sign of ['board', 'poster', 'hall', 'site']) {
      const box = boxOf(layer, `[data-sign="${sign}"]`);
      if (box === null) throw new Error(`The ${sign} sign is not shown.`);
      expect({ sign, free: host.freeSpot({ w: 60, h: 60, within: box }) }).toEqual({ sign, free: null });
    }
  });

  test('hangs a blade sign with the same numbers when a window covers the board, and takes it down after', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setGauges({ crowd: 9, daily: 23 });
    expect(signText(layer, 'blade-board')).toBeNull();

    host.setWindowFrames([{ x: 0, y: 600, w: 300, h: 300 }]);
    const blade = boxOf(layer, '[data-sign="blade-board"]');
    expect(signText(layer, 'blade-board')).toBe('ON TRAMLO ACTIVE 9 COMMITS 23');
    expect(blade !== null && host.visibleFraction(blade)).toBe(1);

    host.setWindowFrames([]);
    expect(signText(layer, 'blade-board')).toBeNull();
  });

  test('the crane follows the build state on its site sign, in the display language', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    expect(signText(layer, 'site')).toBe('30 JOURS SANS ACCIDENT DE MISE EN LIGNE');

    host.setGauges({ build: 'building' });
    expect(signText(layer, 'site')).toMatch(/^30 JOURS SANS ACCIDENT MISE EN LIGNE/);

    host.setGauges({ build: 'ready' });
    expect(signText(layer, 'site')).toBe('30 JOURS SANS ACCIDENT EN LIGNE À 14:00');

    host.setGauges({ build: 'error' });
    expect(signText(layer, 'site')).toBe('0 JOUR SANS ACCIDENT DE MISE EN LIGNE');
  });

  test('the English site sign reads as a sentence, then as a status, whatever the build does', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    expect(signText(layer, 'site')).toBe('30 DAYS SINCE LAST CRASH IN PROD');

    host.setGauges({ build: 'building' });
    expect(signText(layer, 'site')).toMatch(/^30 DAYS SINCE LAST CRASH DEPLOYING/);

    host.setGauges({ build: 'ready' });
    expect(signText(layer, 'site')).toBe('30 DAYS SINCE LAST CRASH LIVE AT 14:00');

    host.setGauges({ build: 'error' });
    expect(signText(layer, 'site')).toBe('0 DAYS SINCE LAST CRASH IN PROD');
  });

  test('a deploy that goes live after a failure does not reset the day count', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setGauges({ build: 'error' });
    host.setGauges({ build: 'ready' });

    expect(signText(layer, 'site')).toBe('0 JOUR SANS ACCIDENT EN LIGNE À 14:00');
  });

  test('a deploy that goes live straight after a failure clears the wreck', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    const roof = { x: 150, y: 0, w: 210, h: 60 };
    const parked = canvasPrint(layer, roof);
    host.setGauges({ build: 'error' });
    const wrecked = canvasPrint(layer, roof);

    host.setGauges({ build: 'ready' });

    expect(wrecked).not.toBe(parked);
    expect(canvasPrint(layer, roof)).not.toBe(wrecked);
  });

  test('a screen shorter than 900 px keeps the roof and its crane, cropping the cellar', () => {
    const screen = { ...FAKE_SCREEN, width: 1280, height: 800 };
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, screen, screens: [screen] });
    const site = boxOf(mounted.layer, '[data-sign="site"]');

    expect(site !== null && site.y >= 0 && site.y + site.h <= 800).toBe(true);
    expect(pixelAt(mounted.layer, 2, 2)).toBe(PAL.sky);
  });

  test('a blade sign that found no room hangs as soon as a Gag gives its room back', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 600 }]);
    while (host.freeSpot({ w: 60, h: 60, hold: 3000 }) !== null);
    host.setWindowFrames([
      { x: 0, y: 0, w: 1440, h: 600 },
      { x: 0, y: 600, w: 300, h: 300 },
    ]);
    expect(signText(layer, 'blade-board')).toBeNull();

    host.clock.advance(3500);

    expect(signText(layer, 'blade-board')).not.toBeNull();
  });

  test('the crane hoists while a deploy runs, and stands still once delivered', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    const { host, layer } = mounted;
    const print = (): string => canvasPrint(layer, { x: 150, y: 0, w: 210, h: 60 });

    host.setGauges({ build: 'building' });
    const frames = new Set<string>();
    for (let i = 0; i < 12; i += 1) {
      host.clock.advance(250);
      frames.add(print());
    }
    expect(frames.size).toBeGreaterThan(1);

    host.setGauges({ build: 'ready' });
    host.clock.advance(5000);
    const delivered = print();
    host.clock.advance(1000);
    expect(print()).toBe(delivered);
  });

  test('the generic Gag delivers news from an unknown Source on a parcel lettered with its name', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    mounted.host.send({ ...rootEvent(), archetype: null, source: 'Mail' });

    expect(mounted.layer.querySelector('[data-gag="other"]')?.getAttribute('data-prop')).toBe('parcel');
  });
});

/**
 * Returns a plain Event in English, for the generic Gag.
 * @example
 * rootEvent().label; // "Pull request merged"
 */
function rootEvent(): WallpaperEvent {
  return {
    id: 'foreign-1',
    kind: 'mail.received',
    archetype: null,
    recognised: true,
    rarity: 'common',
    label: 'E-mail received',
    source: 'Mail',
    at: new Date(AFTERNOON),
    meta: { detail: 'Invoice for October', tag: 'MAIL' },
  };
}

describe("L'Immeuble's redraws", () => {
  test('a new build state shows at once, without waiting for the next frame', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    const roof = { x: 150, y: 0, w: 210, h: 60 };
    const before = canvasPrint(layer, roof);

    host.setGauges({ build: 'error' });

    expect(canvasPrint(layer, roof)).not.toBe(before);
  });

  test('a fully covered screen draws nothing, whatever happens', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    const covered = canvasPrint(layer);

    host.send(roleEvent('fr', 'money', '+49 €'));
    host.setGauges({ crowd: 12, build: 'building' });
    host.clock.advance(3000);

    expect(canvasPrint(layer)).toBe(covered);
  });

  test('under reduced motion, the night’s TVs hold one picture', () => {
    mounted = mountBuilding({ lang: 'fr', start: NIGHT, reducedMotion: true });
    const { host, layer } = mounted;
    host.setGauges({ crowd: 9 });
    const first = canvasPrint(layer);

    host.clock.advance(4000);

    expect(canvasPrint(layer)).toBe(first);
  });
});
