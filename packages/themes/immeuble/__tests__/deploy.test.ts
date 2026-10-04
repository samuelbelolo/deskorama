import { LANGUAGES } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { plainText } from '../src/plain-text.ts';
import { boxOf } from './box-of.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { deployEvent } from './deploy-event.ts';
import { AFTERNOON } from './instants.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { sendDeploy } from './send-deploy.ts';
import { signText } from './sign-text.ts';
import { underMenuBar } from './under-menu-bar.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** The external screen, right of the MacBook: the next building along the street. */
const EXTERNAL = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 } as const;

describe("L'Immeuble's deploys", () => {
  test.each(LANGUAGES)('each step hangs its own words by the site sign, never a Gag, in %s', (lang) => {
    mounted = mountBuilding({ lang, start: AFTERNOON });
    const { host, layer } = mounted;

    for (const step of ['started', 'succeeded'] as const) {
      sendDeploy(host, lang, step);
      host.clock.advance(200);

      const facts = Array.from(layer.querySelectorAll('[data-part="caption-fact"]'), (node) =>
        node.textContent?.trim(),
      );
      expect(facts).toContain(plainText(deployEvent(lang, step).label));
      expect(layer.querySelector('[data-gag]')).toBeNull();
    }
  });

  test('the site sign tells the deploy as it goes, and when it went live', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;

    sendDeploy(host, 'fr', 'started');
    host.clock.advance(200);
    expect(signText(layer, 'site')).toMatch(/^30 JOURS SANS ACCIDENT MISE EN LIGNE/);

    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(200);
    expect(signText(layer, 'site')).toBe('30 JOURS SANS ACCIDENT EN LIGNE À 14:00');
  });

  test('every step reads behind the default windows: its plaque in full view, the crane rolled to show its sign', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);

    sendDeploy(host, 'fr', 'started');
    host.clock.advance(4000);

    const sign = boxOf(layer, '[data-sign="site"]');
    const caption = boxOf(layer, '[data-part="caption"]');
    expect(sign !== null && host.visibleFraction(underMenuBar(sign))).toBeGreaterThanOrEqual(0.5);
    expect(caption !== null && host.visibleFraction(caption)).toBe(1);

    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(200);
    const live = Array.from(layer.querySelectorAll('[data-part="caption"]')).map((node) => boxOf(layer, node));
    expect(live.every((box) => box !== null && host.visibleFraction(box) === 1)).toBe(true);
  });

  test('the next building’s yard follows the same deploy on its own hoarding sign', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, screen: EXTERNAL, screens: [EXTERNAL] });
    const { host, layer } = mounted;

    sendDeploy(host, 'en', 'started');
    host.clock.advance(200);
    expect(signText(layer, 'site')).toMatch(/^30 DAYS SINCE LAST CRASH DEPLOYING/);
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe('DEPLOY STARTED');

    sendDeploy(host, 'en', 'succeeded');
    host.clock.advance(200);
    expect(signText(layer, 'site')).toBe('30 DAYS SINCE LAST CRASH LIVE AT 14:00');
  });
});
