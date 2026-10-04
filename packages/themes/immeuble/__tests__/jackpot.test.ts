import { LANGUAGES, type Rect } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { JACKPOT_MS } from '../src/create-jackpot.ts';
import { plainText } from '../src/plain-text.ts';
import { boxOf } from './box-of.ts';
import { canvasPrint } from './canvas-print.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { deployEvent } from './deploy-event.ts';
import { AFTERNOON } from './instants.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { roleEvent } from './role-event.ts';
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

/** What the arcade box and the concierge say, and where the scene's words stand. */
interface Said {
  readonly arcade: string;
  readonly concierge: string | null;
  readonly boxes: readonly Rect[];
}

/**
 * Returns what the failed-deploy scene says right now, and the boxes of its words: the arcade, the concierge's
 * dialog, the shouts and the plaque.
 * @example
 * said(layer).arcade; // "FIN DE PARTIE CONTINUER ? 8 INSÉREZ UNE PIÈCE"
 */
function said(layer: HTMLElement): Said {
  const words = (selector: string): string | null => layer.querySelector(selector)?.textContent?.trim() ?? null;
  const parts = layer.querySelectorAll(
    '[data-part="arcade"], [data-part="concierge"], [data-part="shout"], [data-part="caption"]',
  );

  return {
    arcade: words('[data-part="arcade"]') ?? '',
    concierge: words('[data-part="concierge"]'),
    boxes: Array.from(parts).flatMap((part) => boxOf(layer, part) ?? []),
  };
}

describe("L'Immeuble's failed deploy, the jackpot", () => {
  test.each(LANGUAGES)('brings the site down to a red zero with the arcade and the concierge, in %s', (lang) => {
    mounted = mountBuilding({ lang, start: AFTERNOON });
    const { host, layer } = mounted;
    sendDeploy(host, lang, 'failed');
    host.clock.advance(3000);

    const scene = said(layer);
    const zero = lang === 'fr' ? '0 JOUR SANS ACCIDENT DE MISE EN LIGNE' : '0 DAYS SINCE LAST CRASH IN PROD';
    expect(signText(layer, 'site')).toBe(zero);
    expect(scene.arcade).toBe(
      lang === 'fr' ? 'FIN DE PARTIE CONTINUER ? 8 INSÉREZ UNE PIÈCE' : 'GAME OVER CONTINUE? 8 INSERT COIN',
    );
    expect(scene.concierge).toBe(lang === 'fr' ? "ET C'EST MOI QUI BALAIE." : "I'LL GET THE MOP.");
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe(
      plainText(deployEvent(lang, 'failed').label),
    );
    expect(
      Array.from(layer.querySelectorAll('[data-part="shout-text"]'), (node) => node.textContent?.trim()),
    ).toContain(lang === 'fr' ? 'AU SECOURS !' : 'HELP!');
  });

  test('counts down, then says goodbye, and leaves once the scene is over', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    sendDeploy(host, 'fr', 'failed');

    host.clock.advance(5000);
    expect(said(layer).arcade).toContain('CONTINUER ? 6');
    host.clock.advance(5000);
    expect(said(layer).arcade).toContain('À LA PROCHAINE');
    host.clock.advance(JACKPOT_MS);
    expect(layer.querySelector('[data-part="arcade"]')).toBeNull();
    expect(signText(layer, 'site')).toBe('0 JOUR SANS ACCIDENT DE MISE EN LIGNE');
  });

  test('survives the default windows: every word it says is in full view', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    sendDeploy(host, 'fr', 'failed');
    host.clock.advance(3000);

    const scene = said(layer);
    expect(scene.arcade).toContain('FIN DE PARTIE');
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent?.trim()).toBe('MISE EN LIGNE RATÉE');
    expect(scene.boxes.filter((box) => host.visibleFraction(box) < 1)).toEqual([]);

    const sign = boxOf(layer, '[data-sign="site"]');
    expect(sign !== null && host.visibleFraction(underMenuBar(sign))).toBeGreaterThanOrEqual(0.5);
  });

  test('never waits for room: it finds its arcade box once the Gags playing give theirs back', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    for (const role of ['approval', 'blocked', 'money', 'like', 'usage'] as const) host.send(roleEvent('en', role));
    sendDeploy(host, 'en', 'failed');
    host.clock.advance(200);
    expect(signText(layer, 'site')).toBe('0 DAYS SINCE LAST CRASH IN PROD');

    host.clock.advance(6500);
    expect(said(layer).arcade).not.toBe('');
  });

  test('plays on the next building too, where the concierge’s line ends the game in the arcade box', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON, screen: EXTERNAL, screens: [EXTERNAL] });
    const { host, layer } = mounted;
    sendDeploy(host, 'fr', 'failed');
    host.clock.advance(3000);

    expect(signText(layer, 'site')).toBe('0 JOUR SANS ACCIDENT DE MISE EN LIGNE');
    expect(said(layer).concierge).toBeNull();
    expect(said(layer).arcade).toContain('CONTINUER ? 8');

    host.clock.advance(7000);
    expect(said(layer).arcade).toBe("ET C'EST MOI QUI BALAIE.");
  });

  test('holds one key frame under reduced motion, and moves otherwise', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    sendDeploy(mounted.host, 'en', 'failed');
    mounted.host.clock.advance(500);
    const still = canvasPrint(mounted.layer);
    mounted.host.clock.advance(1000);
    expect(canvasPrint(mounted.layer)).toBe(still);
    expect(said(mounted.layer).arcade).toContain('CONTINUE? 8');
    mounted.unmount();

    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    sendDeploy(mounted.host, 'en', 'failed');
    mounted.host.clock.advance(500);
    const first = canvasPrint(mounted.layer);
    mounted.host.clock.advance(1000);
    expect(canvasPrint(mounted.layer)).not.toBe(first);
  });
});
