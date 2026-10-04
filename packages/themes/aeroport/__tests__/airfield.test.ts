import type { Screen } from '@deskorama/core';
import { FAKE_SCREEN } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { NAMED_DELAY, TIMING } from '../src/flight-geometry.ts';
import { handoffDelay } from '../src/handoff-delay.ts';
import { boxOf } from './box-of.ts';
import { deployEvent } from './deploy-event.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { sendDeploy } from './send-deploy.ts';

let mounted: MountedAirport[] = [];

afterEach(() => {
  for (const airport of mounted) airport.unmount();
  mounted = [];
  document.body.replaceChildren();
});

/** A 16:9 screen right of the MacBook, top edges aligned, as in the demo. */
const EXTERNAL: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };

/** The same screen on the MacBook's left. */
const LEFT: Screen = { id: 'left', x: -1600, y: 0, width: 1600, height: 900 };

/**
 * Mounts the airport on one screen of an arrangement and keeps it to unmount after the test.
 * @example
 * const external = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL]);
 */
function mountOn(screen: Screen, screens: readonly Screen[], lang: 'fr' | 'en' = 'fr'): MountedAirport {
  const airport = mountAirport({ lang, start: AFTERNOON, screen, screens });
  mounted.push(airport);

  return airport;
}

/**
 * Returns the opacity of the PROD Caravelle on a screen, or null when none is drawn.
 * @example
 * planeOpacity(external.layer); // 0 before the hand-off
 */
function planeOpacity(layer: HTMLElement): number | null {
  const plane = layer.querySelector<HTMLElement>('[data-part="deploy-plane"]');

  return plane === null ? null : Number(plane.style.opacity);
}

describe("L'Aéroport's airfield, on a screen other than the main one", () => {
  test('draws the fire station, the cargo stand, the far end of the runway and the Arrivals board', () => {
    const { layer } = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL], 'en');
    const words = layer.textContent ?? '';

    expect(words).toContain('AIRPORT FIRE SERVICE');
    expect(words).toContain('CARGO');
    expect(words).toContain('Arrivals');
    expect(words).toContain('27');
    expect(layer.querySelector('[data-part="cargo-plane"]')).not.toBeNull();
    const terminalParts = ['queue', 'parked-plane', 'pile', 'signs', 'beam'];
    expect(terminalParts.filter((part) => layer.querySelector(`[data-part="${part}"]`) !== null)).toEqual([]);
  });

  test('shows the Gauges in the Arrivals board’s header, with the Source’s words', () => {
    const { layer, host } = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL], 'fr');
    host.setGauges({ crowd: 4, daily: 23, total: 37 });
    host.clock.advance(3000);

    const text = (part: string): string => (layer.querySelector(`[data-part="${part}"]`)?.textContent ?? '').trim();
    expect([text('board-crowd'), text('board-daily'), text('board-total')]).toEqual(['4', '23', '37']);
    expect(layer.querySelector('.aeroport-board-numbers')?.textContent).toContain('ACTIFS');
  });

  test('continues the take-off: the plane leaves the main screen and enters at the left edge at that moment', () => {
    const terminal = mountOn(FAKE_SCREEN, [FAKE_SCREEN, EXTERNAL]);
    const external = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL]);
    const succeeded = deployEvent('fr', 'succeeded');
    for (const { host } of [terminal, external]) sendDeploy(host, 'fr', 'succeeded');

    const handoff = handoffDelay(succeeded);
    for (const { host } of [terminal, external]) host.clock.advance(handoff - 100);
    expect(planeOpacity(external.layer)).toBe(0);
    expect(boxOf(terminal.layer, '[data-part="deploy-plane"]')?.x).toBeGreaterThan(800);

    for (const { host } of [terminal, external]) host.clock.advance(TIMING.handoff);
    const entered = boxOf(external.layer, '[data-part="deploy-plane"]');
    expect(planeOpacity(external.layer)).toBe(1);
    expect(entered?.x).toBeGreaterThan(-450);
    expect(entered?.x).toBeLessThan(400);
    expect(external.layer.querySelector('[data-slot="name"]')?.textContent).toBe('v2.5.0');

    for (const { host } of [terminal, external]) host.clock.advance(TIMING.beyond + 500);
    expect(planeOpacity(external.layer)).toBeNull();
    expect(planeOpacity(terminal.layer)).toBeNull();
  });

  test('shows the deploy’s Caption as the plane flies over', () => {
    const { layer, host } = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL], 'en');
    sendDeploy(host, 'en', 'succeeded');
    expect(layer.querySelector('[data-part="caption"]')).toBeNull();

    host.clock.advance(NAMED_DELAY + TIMING.roll + TIMING.climb);
    expect(layer.querySelector('[data-part="caption-fact"]')?.textContent).toBe('Deploy succeeded');
  });

  test('sees no plane when it stands on the main screen’s left', () => {
    const { layer, host } = mountOn(LEFT, [LEFT, FAKE_SCREEN]);
    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(handoffDelay(deployEvent('fr', 'succeeded')) + 1000);

    expect(layer.querySelector('[data-part="deploy-plane"]')).toBeNull();
  });

  test('a failed deploy sends the fire truck out of its station toward the main screen, under the signature', () => {
    const { layer, host } = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL]);
    sendDeploy(host, 'fr', 'failed');
    host.clock.advance(400);
    const leaving = boxOf(layer, '[data-part="fire-truck"]');
    host.clock.advance(1500);
    const racing = boxOf(layer, '[data-part="fire-truck"]');

    expect(racing?.x).toBeLessThan(leaving?.x ?? 0);
    expect(layer.querySelector('[data-part="big-panel-line-0"]')?.textContent?.trim()).toBe('VOL ANNULÉ');
    host.clock.advance(5000);
    expect(layer.querySelector('[data-part="fire-truck"]')).toBeNull();
  });

  test('writes a Gauge too long for its cells compactly, never cut', () => {
    const { layer, host } = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL], 'en');
    host.setGauges({ crowd: 4, daily: 12_345, total: 123_456 });
    host.clock.advance(3000);

    const text = (part: string): string => (layer.querySelector(`[data-part="${part}"]`)?.textContent ?? '').trim();
    expect([text('board-daily'), text('board-total')]).toEqual(['12.3K', '123.5K']);
  });

  test('joins the main screen’s flight at the same point even when a window hides the runway there', () => {
    const terminal = mountOn(FAKE_SCREEN, [FAKE_SCREEN, EXTERNAL]);
    const external = mountOn(EXTERNAL, [FAKE_SCREEN, EXTERNAL]);
    terminal.host.setWindowFrames([{ x: 400, y: 660, w: 1040, h: 240 }]);
    for (const { host } of [terminal, external]) sendDeploy(host, 'fr', 'succeeded');
    for (const { host } of [terminal, external]) host.clock.advance(handoffDelay(deployEvent('fr', 'succeeded')) + 800);

    const left = boxOf(terminal.layer, '[data-part="deploy-plane"]');
    const right = boxOf(external.layer, '[data-part="deploy-plane"]');
    expect(Math.abs((left?.x ?? 0) - ((right?.x ?? 0) + EXTERNAL.x))).toBeLessThan(40);
    expect(Math.abs((left?.y ?? 0) - (right?.y ?? 0))).toBeLessThan(40);
  });

  test('flies on until the plane has left a wide screen', () => {
    const wide = { ...EXTERNAL, width: 2560 };
    const { layer, host } = mountOn(wide, [FAKE_SCREEN, wide]);
    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(handoffDelay(deployEvent('fr', 'succeeded')) + TIMING.handoff + TIMING.beyond + 100);

    expect(layer.querySelector('[data-part="deploy-plane"]')).not.toBeNull();
    host.clock.advance(20_000);
    expect(layer.querySelector('[data-part="deploy-plane"]')).toBeNull();
  });

  test('a screen beyond the neighbour flies no plane of its own', () => {
    const next = { ...EXTERNAL, id: 'next', x: EXTERNAL.x + EXTERNAL.width };
    const { layer, host } = mountOn(next, [FAKE_SCREEN, EXTERNAL, next]);
    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(handoffDelay(deployEvent('fr', 'succeeded')) + 2000);

    expect(layer.querySelector('[data-part="deploy-plane"]')).toBeNull();
  });

  test('sends the fire truck toward the main screen when it stands on the right', () => {
    const { layer, host } = mountOn(LEFT, [LEFT, FAKE_SCREEN]);
    sendDeploy(host, 'fr', 'failed');
    host.clock.advance(400);
    const leaving = boxOf(layer, '[data-part="fire-truck"]');
    host.clock.advance(1500);

    expect(boxOf(layer, '[data-part="fire-truck"]')?.x).toBeGreaterThan(leaving?.x ?? 0);
  });
});
