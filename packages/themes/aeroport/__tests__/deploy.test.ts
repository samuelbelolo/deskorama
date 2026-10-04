import type { WallpaperEvent } from '@deskorama/core';
import { createFakeScreenHost } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { createAeroport } from '../src/create-aeroport.ts';
import { NAMED_DELAY, TIMING } from '../src/flight-geometry.ts';
import { boxOf } from './box-of.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { sendDeploy } from './send-deploy.ts';

let mounted: MountedAirport[] = [];

afterEach(() => {
  for (const airport of mounted) airport.unmount();
  mounted = [];
  document.body.replaceChildren();
});

/**
 * Mounts an airport and keeps it to unmount after the test.
 * @example
 * const { layer, host } = mount({ lang: 'en' });
 */
function mount(options: Parameters<typeof mountAirport>[0] = {}): MountedAirport {
  const airport = mountAirport({ start: AFTERNOON, ...options });
  mounted.push(airport);

  return airport;
}

/**
 * Returns the text of one part of the scene, or null when it is not drawn.
 * @example
 * partText(layer, 'caption-fact'); // "Mise en ligne lancée"
 */
function partText(layer: HTMLElement, part: string): string | null {
  return layer.querySelector(`[data-part="${part}"]`)?.textContent ?? null;
}

describe("L'Aéroport's PROD flight", () => {
  test('a started deploy taxis the Caravelle to the threshold, with its Caption, and keeps it there', () => {
    const { layer, host } = mount({ lang: 'fr' });
    sendDeploy(host, 'fr', 'started');

    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeLessThan(0);
    expect(partText(layer, 'caption-fact')).toBe('Mise en ligne lancée');
    host.clock.advance(TIMING.taxi + 100);
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);

    host.clock.advance(60_000);
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);
  });

  test('a success christens the plane with the tag, the tower clears it, and it takes off out of the screen', () => {
    const { layer, host } = mount({ lang: 'en' });
    sendDeploy(host, 'en', 'started');
    host.clock.advance(TIMING.taxi + 500);
    sendDeploy(host, 'en', 'succeeded');
    host.clock.advance(800);

    const name = layer.querySelector('[data-slot="name"]');
    expect(name?.textContent).toBe('v2.5.0');
    expect(name?.getAttribute('opacity')).toBe('1.000');
    expect(partText(layer, 'caption-fact')).toBe('Deploy succeeded');
    const said = Array.from(layer.querySelectorAll<HTMLElement>('[data-part="bubble"]')).map(
      (bubble) => bubble.textContent,
    );
    expect(said).toContain('Prod flight v2.5.0, cleared for take-off, runway 09.');

    host.clock.advance(NAMED_DELAY + TIMING.roll + TIMING.climb);
    expect(layer.querySelector('[data-part="deploy-plane"]')).toBeNull();
  });

  test('a success with no line-up first brings the plane to the threshold, then flies it', () => {
    const { layer, host } = mount({ lang: 'fr' });
    sendDeploy(host, 'fr', 'succeeded');

    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);
    host.clock.advance(NAMED_DELAY + TIMING.roll / 2);
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeGreaterThan(30);
  });

  test('a screen mounted while a build runs shows the plane waiting at the threshold', () => {
    const layer = document.createElement('div');
    document.body.append(layer);
    const host = createFakeScreenHost({ lang: 'fr', start: AFTERNOON });
    host.setGauges({ build: 'building' });
    mounted.push({ layer, host, unmount: createAeroport().mount(layer, host) });

    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);
  });

  test('a deploy is never queued behind a Gag, and never listed on the board', () => {
    const { layer, host } = mount({ lang: 'en' });
    host.send({ ...deployless(), id: 'busy' });
    sendDeploy(host, 'en', 'started');

    expect(layer.querySelector('[data-part="deploy-plane"]')).not.toBeNull();
    expect(partText(layer, 'board-row-0-flight')?.trim()).not.toContain('DEPLOY');
  });

  test('follows the build Gauge when no step says so: a running build brings a plane, an ended one sends it off', () => {
    const { layer, host } = mount({ lang: 'fr' });
    host.setGauges({ build: 'building' });
    host.clock.advance(50);
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeCloseTo(30, 0);

    host.setGauges({ build: 'idle' });
    host.clock.advance(50);
    expect(layer.querySelector('[data-part="deploy-plane"]')).toBeNull();
  });

  test('a deploy started during a take-off brings a fresh plane, never the departing one back', () => {
    const { layer, host } = mount({ lang: 'fr' });
    sendDeploy(host, 'fr', 'succeeded');
    host.clock.advance(NAMED_DELAY + TIMING.roll);
    sendDeploy(host, 'fr', 'started', 'v2.6.0');
    host.clock.advance(100);

    expect(layer.querySelectorAll('[data-part="deploy-plane"]')).toHaveLength(1);
    expect(boxOf(layer, '[data-part="deploy-plane"]')?.x).toBeLessThan(0);
    expect(layer.querySelector('[data-slot="name"]')?.textContent).toBe('');
  });
});

/**
 * Returns an everyday Event that plays a Gag while a deploy arrives.
 * @example
 * deployless().archetype; // "money"
 */
function deployless(): WallpaperEvent {
  return {
    id: 'money',
    kind: 'invoice.paid',
    archetype: 'money',
    recognised: true,
    rarity: 'common',
    label: 'Payment received',
    source: 'Tramlo',
    at: new Date(AFTERNOON),
    meta: { detail: 'Invoice 42', tag: '+49 €' },
  };
}
