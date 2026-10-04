import type { Archetype, BuildState, Language } from '@deskorama/core';
import { FAKE_SCREEN } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { page, server } from 'vitest/browser';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { group } from './recap-group.ts';
import { genericEvent } from './generic-event.ts';
import { AFTERNOON, NIGHT } from './instants.ts';
import { milestone } from './milestone.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { roleEvent } from './role-event.ts';
import { rootOf } from './root-of.ts';
import { sendDeploy } from './send-deploy.ts';

let mounted: MountedBuilding | undefined;

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
  ['rejection', 'fr', 'À REVOIR'],
  ['money', 'en', '+$10'],
  ['blocked', 'fr', 'SPAM'],
  ['arrival', 'en', '#12'],
  ['partner', 'fr', 'SPONSOR'],
  ['departure', 'en', 'BRANCH'],
  ['abandon', 'fr', 'FERMÉE'],
  ['message', 'en', '#7'],
  ['publish', 'fr', 'V2.5.0'],
  ['usage', 'en', 'CSV'],
  ['error', 'fr', 'CI'],
];

/**
 * Returns the building's root as a locator, the part each screenshot frames.
 * @example
 * await expect.element(locate(layer)).toMatchScreenshot('afternoon');
 */
function locate(layer: HTMLElement): ReturnType<typeof page.elementLocator> {
  return page.elementLocator(rootOf(layer));
}

// Reference screenshots are Linux ones, made in CI: a rendering change on another system is no regression, so the
// comparison only runs there.
describe.runIf(server.platform === 'linux')("L'Immeuble's drawing", () => {
  test.each([
    ['afternoon', AFTERNOON],
    ['night', NIGHT],
  ] as const)('the still scene in the %s', async (name, start) => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang: 'fr', start });
    mounted.host.setGauges(GAUGES);

    await expect.element(locate(mounted.layer)).toMatchScreenshot(`scene-${name}`);
  });

  test.each(KEY_POSES)('the %s Gag in %s at its key pose', async (role, lang, tag) => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang, start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    mounted.host.send(roleEvent(lang, role, tag));
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot(`gag-${role}-${lang}`);
  });

  test.each(['fr', 'en'] as const)('the generic Gag in %s at its key pose', async (lang) => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang, start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    mounted.host.send(genericEvent(lang, 'foreign'));
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot(`gag-generic-${lang}`);
  });

  test('four Gags side by side behind the default windows', async () => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    mounted.host.setWindowFrames(DEFAULT_WINDOWS);
    for (const role of ['approval', 'blocked', 'money', 'like'] as const) mounted.host.send(roleEvent('fr', role));
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot('burst-default-windows');
  });

  test.each(['building', 'error'] as const)('the crane while the build is %s', async (build: BuildState) => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges({ ...GAUGES, build });
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot(`crane-${build}`);
  });

  test('a taller, wider screen with the neighbour’s facade', async () => {
    await page.viewport(1728, 1117);
    const screen = { ...FAKE_SCREEN, width: 1728, height: 1117 };
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, screen, screens: [screen] });
    mounted.host.setGauges(GAUGES);

    await expect.element(locate(mounted.layer)).toMatchScreenshot('scene-1728');
  });

  test.each(['fr', 'en'] as const)(
    'the celebration in %s behind the default windows, at its key pose',
    async (lang) => {
      await page.viewport(1440, 900);
      mounted = mountBuilding({ lang, start: AFTERNOON, reducedMotion: true });
      mounted.host.setGauges(GAUGES);
      mounted.host.setWindowFrames(DEFAULT_WINDOWS);
      mounted.host.send(milestone(lang));
      mounted.host.clock.advance(200);

      await expect.element(locate(mounted.layer)).toMatchScreenshot(`celebration-${lang}`);
    },
  );

  test.each(['fr', 'en'] as const)(
    'the failed deploy in %s behind the default windows, at its key frame',
    async (lang) => {
      await page.viewport(1440, 900);
      mounted = mountBuilding({ lang, start: AFTERNOON, reducedMotion: true });
      mounted.host.setGauges(GAUGES);
      mounted.host.setWindowFrames(DEFAULT_WINDOWS);
      sendDeploy(mounted.host, lang, 'failed');
      mounted.host.clock.advance(600);

      await expect.element(locate(mounted.layer)).toMatchScreenshot(`jackpot-${lang}`);
    },
  );

  test('a deploy under way, its plaque by the site sign', async () => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    sendDeploy(mounted.host, 'fr', 'started');
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot('deploy-started');
  });

  test('the recap board, its counts all up', async () => {
    await page.viewport(1440, 900);
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    mounted.host.setGauges(GAUGES);
    const groups = [group('celebration', 'rare', 1), group('approval', 'notable', 5), group('error', 'common', 2)];
    mounted.host.sendRecap({
      from: new Date(AFTERNOON - 7_200_000),
      to: new Date(AFTERNOON),
      total: 12,
      groups,
      more: 4,
    });
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot('recap');
  });

  test('the next building along the street, on the external screen', async () => {
    await page.viewport(1600, 900);
    const external = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, screen: external, screens: [FAKE_SCREEN, external] });
    mounted.host.setGauges({ ...GAUGES, build: 'building' });
    mounted.host.clock.advance(200);

    await expect.element(locate(mounted.layer)).toMatchScreenshot('next-building');
  });
});
