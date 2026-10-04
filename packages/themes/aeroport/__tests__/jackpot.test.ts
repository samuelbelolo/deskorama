import type { Rect } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { TIMING } from '../src/flight-geometry.ts';
import { TAKEOVER_CELLS } from '../src/take-over-rows.ts';
import { TEXT } from '../src/text-for.ts';
import { boxOf } from './box-of.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { sendDeploy } from './send-deploy.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** Windows over everything but the board, so neither the panel nor any Gag finds room. */
const ONLY_THE_BOARD: readonly Rect[] = [
  { x: 0, y: 0, w: 1440, h: 30 },
  { x: 0, y: 0, w: 870, h: 900 },
  { x: 1320, y: 0, w: 120, h: 900 },
  { x: 870, y: 280, w: 450, h: 620 },
];

/** Windows over everything but a strip of grass along the bottom edge. */
const ONLY_A_STRIP: readonly Rect[] = [{ x: 0, y: 0, w: 1440, h: 840 }];

/**
 * Returns the text of every part of the scene marked `part`, each trimmed.
 * @example
 * texts(layer, 'big-panel-line-0'); // ["VOL ANNULÉ"]
 */
function texts(layer: HTMLElement, part: string): string[] {
  return Array.from(layer.querySelectorAll(`[data-part="${part}"]`), (node) => (node.textContent ?? '').trim());
}

/**
 * Mounts the airport behind `frames` and plays a failed deploy, `after` ms in.
 * @example
 * const { layer } = failAt('fr', DEFAULT_WINDOWS, 2400);
 */
function failAt(lang: 'fr' | 'en', frames: readonly Rect[], after: number): MountedAirport {
  mounted = mountAirport({ lang, start: AFTERNOON });
  mounted.host.setWindowFrames(frames);
  mounted.host.clock.advance(200);
  sendDeploy(mounted.host, lang, 'failed');
  mounted.host.clock.advance(after);

  return mounted;
}

describe("L'Aéroport's failed deploy", () => {
  test('foams the stranded plane with the fire truck while two crew argue and the tower calls for help', () => {
    const { layer } = failAt('fr', [], 6000);

    expect(layer.querySelector('[data-part="deploy-plane"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="fire-truck"]')).not.toBeNull();
    expect(layer.querySelectorAll('[data-part="arguing-crew"]')).toHaveLength(2);
    const foamed = Array.from(layer.querySelectorAll('.foam')).filter((blob) => Number(blob.getAttribute('r')) > 0);
    expect(foamed.length).toBeGreaterThan(20);
    expect(texts(layer, 'bubble')).toContain('Prod-les-Bains, on a un problème.');
    expect(texts(layer, 'caption-fact')).toEqual(['Mise en ligne ratée']);
  });

  test.each(['fr', 'en'] as const)('puts its signature on the giant panel when there is room, in %s', (lang) => {
    const { layer } = failAt(lang, [], 2000);

    expect(texts(layer, 'big-panel-line-0')).toEqual([TEXT[lang].jackpot.panel[0]]);
    expect(texts(layer, 'big-panel-line-1')).toEqual([TEXT[lang].jackpot.panel[1]]);
  });

  test('shows its signature behind the default windows', () => {
    const { layer, host } = failAt('fr', DEFAULT_WINDOWS, 2000);
    const shown = boxOf(layer, '[data-part="big-panel"]') ?? boxOf(layer, '[data-part="board-takeover"]');

    expect(shown).not.toBeNull();
    expect(host.visibleFraction(shown ?? { x: 0, y: 0, w: 0, h: 0 })).toBeGreaterThanOrEqual(0.6);
  });

  test('takes over the board’s first two rows when only the board shows', () => {
    const { layer } = failAt('fr', ONLY_THE_BOARD, 2000);

    expect(layer.querySelector('[data-part="big-panel"]')).toBeNull();
    expect(texts(layer, 'board-takeover-0')).toEqual(['VOL ANNULÉ']);
    expect(texts(layer, 'board-takeover-1')).toEqual(['PISTE FERMÉE']);
  });

  test('forces the panel into the only strip that shows, when even the board is hidden', () => {
    const { layer } = failAt('en', ONLY_A_STRIP, 2000);

    expect(texts(layer, 'big-panel-line-0')).toEqual(['FLIGHT CANCELLED']);
  });

  test('brings the real panel, and gives the board its rows back, once a window moves away', () => {
    const { layer, host } = failAt('fr', ONLY_THE_BOARD, 1000);
    expect(layer.querySelector('[data-part="board-takeover"]')).not.toBeNull();

    host.setWindowFrames([]);
    host.clock.advance(1500);
    expect(layer.querySelector('[data-part="big-panel"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="board-takeover"]')).toBeNull();
  });

  test('takes its signature down after 8 s; the plane and the truck stay on the closed runway', () => {
    const { layer } = failAt('fr', [], 12_000);

    expect(layer.querySelector('[data-part="big-panel"]')).toBeNull();
    expect(layer.querySelector('[data-part="deploy-plane"]')).not.toBeNull();
    expect(layer.querySelector('[data-part="fire-truck"]')).not.toBeNull();
    expect(layer.querySelector('[data-theme="aeroport"]')?.classList.contains('is-closed')).toBe(true);
  });

  test('the next deploy tows the foamed plane away, then a clean plane lines up', () => {
    const { layer, host } = failAt('fr', [], 12_000);
    sendDeploy(host, 'fr', 'started');
    host.clock.advance(1000);
    expect(layer.querySelector('[data-part="tow-tug"]')).not.toBeNull();

    host.clock.advance(4000 + TIMING.taxi);
    expect(layer.querySelector('[data-part="tow-tug"]')).toBeNull();
    expect(layer.querySelector('[data-part="fire-truck"]')).toBeNull();
    expect(layer.querySelectorAll('[data-part="deploy-plane"]')).toHaveLength(1);
    expect(layer.querySelector('.foam')).toBeNull();
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);
  });

  test('a deploy started during the show stops it, so only the tow moves the plane', () => {
    const { layer, host } = failAt('fr', [], 3000);
    sendDeploy(host, 'fr', 'started');
    host.clock.advance(TIMING.taxi + 5000);

    expect(layer.querySelectorAll('[data-part="deploy-plane"]')).toHaveLength(1);
    expect(layer.querySelector('[data-part="arguing-crew"]')).toBeNull();
    expect(layer.querySelector('[data-part="slate"]')).toBeNull();
  });

  test('its two lines are on the drum and fit the board’s takeover, in both languages', () => {
    for (const lang of ['fr', 'en'] as const) {
      for (const line of TEXT[lang].jackpot.panel) expect(line.length).toBeLessThanOrEqual(TAKEOVER_CELLS);
    }
  });
});
