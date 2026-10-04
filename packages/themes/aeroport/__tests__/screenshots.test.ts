import type { Archetype, Language } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { page, server } from 'vitest/browser';
import { FAKE_SCREEN, wallpaperEventFixture } from '@deskorama/test-utils';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { AFTERNOON, NIGHT } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { roleEvent } from './role-event.ts';
import { sendDeploy } from './send-deploy.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** Gauges that fill the scene the same way in every screenshot. */
const GAUGES = { crowd: 9, daily: 23, total: 37 } as const;

/** Frozen instants of everyday Gags: each held still at its key pose with reduced motion. */
const KEY_POSES: readonly (readonly [Archetype, Language, string])[] = [
  ['like', 'fr', 'LGTM'],
  ['approval', 'en', 'MERGED'],
  ['error', 'fr', 'CI'],
  ['money', 'en', '+$10'],
];

/**
 * Returns the airport's root, the part each screenshot frames.
 * @example
 * await expect.element(airportOf(layer)).toMatchScreenshot('afternoon');
 */
function airportOf(layer: HTMLElement): ReturnType<typeof page.elementLocator> {
  const root = layer.querySelector('[data-theme="aeroport"]');
  if (root === null) throw new Error('The airport is not mounted.');

  return page.elementLocator(root);
}

// Reference screenshots are Linux ones, made in CI: a font or an antialiasing change on another system is no
// regression, so the comparison only runs there.
describe.runIf(server.platform === 'linux')("L'Aéroport's drawing", () => {
  test.each([
    ['afternoon', AFTERNOON],
    ['night', NIGHT],
  ] as const)('the still scene in the %s', async (name, start) => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang: 'fr', start });
    mounted.host.setGauges(GAUGES);

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot(`scene-${name}`);
  });

  test.each(KEY_POSES)('the %s Gag in %s at its key pose', async (role, lang, tag) => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang, start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    mounted.host.send(roleEvent(lang, role, tag));

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot(`gag-${role}-${lang}`);
  });

  test('the golden jet at its key pose, behind the default windows', async () => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    mounted.host.setWindowFrames(DEFAULT_WINDOWS);
    mounted.host.clock.advance(200);
    mounted.host.send(wallpaperEventFixture('fr', { id: 'milestone', archetype: 'celebration', rarity: 'rare' }));

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot('celebration-fr');
  });

  test('the failed deploy at its key pose', async () => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    sendDeploy(mounted.host, 'en', 'failed');
    mounted.host.clock.advance(2000);

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot('jackpot-en');
  });

  test('the airfield on the external screen', async () => {
    await page.viewport(1600, 900);
    const external = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, screen: external, screens: [FAKE_SCREEN, external] });
    mounted.host.setGauges(GAUGES);

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot('airfield-fr');
  });

  test('the PROD flight christened and lifting its nose', async () => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    sendDeploy(mounted.host, 'fr', 'succeeded');

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot('take-off-fr');
  });

  test('the recap on the baggage belt', async () => {
    await page.viewport(1440, 900);
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    const latest = wallpaperEventFixture('en', { archetype: 'approval' });
    mounted.host.sendRecap({
      from: new Date(AFTERNOON - 3_600_000),
      to: new Date(AFTERNOON),
      total: 9,
      groups: [{ archetype: 'approval', rarity: 'notable', count: 5, latest }],
      more: 4,
    });

    await expect.element(airportOf(mounted.layer)).toMatchScreenshot('recap-en');
  });
});
