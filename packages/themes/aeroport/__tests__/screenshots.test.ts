import type { Archetype, Language } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { page, server } from 'vitest/browser';
import { AFTERNOON, NIGHT } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { roleEvent } from './role-event.ts';

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
});
