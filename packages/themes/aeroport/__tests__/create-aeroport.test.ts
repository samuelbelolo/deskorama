import type { Archetype, SourceEvent } from '@deskorama/core';
import { createFakeScreenHost, FRAME_MS, wallpaperEventFixture, type FakeScreenHost } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { createAeroport } from '../src/create-aeroport.ts';
import { CAPTION_HOLD_MS } from '../src/caption-room.ts';
import { GENERIC_GAG_MS } from '../src/freight-timing.ts';

/** An Event from a foreign Source: no Role, so it plays the freight Gag. */
const FOREIGN: Partial<SourceEvent> = { archetype: null };

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.replaceChildren();
});

/**
 * Mounts L'Aéroport on a fresh layer and returns the layer with its fake host.
 * @example
 * const { layer, host } = mountAirport({ lang: 'en' });
 */
function mountAirport(options: Parameters<typeof createFakeScreenHost>[0] = {}): {
  layer: HTMLElement;
  host: FakeScreenHost;
} {
  const layer = document.createElement('div');
  document.body.append(layer);
  const host = createFakeScreenHost(options);
  unmount = createAeroport().mount(layer, host);
  return { layer, host };
}

/**
 * Returns the text of one part of the scene, or null when it is not drawn.
 * @example
 * partText(layer, 'caption-fact'); // "Pull request merged"
 */
function partText(layer: HTMLElement, part: string): string | null {
  return layer.querySelector(`[data-part="${part}"]`)?.textContent ?? null;
}

describe("L'Aéroport", () => {
  test('draws the poster with the airport named in the display language', () => {
    expect(mountAirport({ lang: 'fr' }).layer.textContent).toContain('PROD-LES-BAINS');
    unmount?.();
    expect(mountAirport({ lang: 'en' }).layer.textContent).toContain('PROD-ON-SEA');
  });

  const generic: (Archetype | null)[] = ['celebration', 'deploy', null];
  test.each(generic)('plays the freight Gag with its Caption, fact then detail, for the Role %s', (archetype) => {
    const { layer, host } = mountAirport({ lang: 'en' });
    host.send(wallpaperEventFixture('en', { archetype }));
    const caption = layer.querySelector('[data-part="caption"]')?.textContent ?? '';
    expect(caption.indexOf('Pull request merged')).toBeGreaterThanOrEqual(0);
    expect(caption.indexOf('Pull request merged')).toBeLessThan(caption.indexOf('#418 Fixes Google sign-in'));
    expect(partText(layer, 'caption-source')).toBe('Tramlo');
    expect(partText(layer, 'crate-label')).toBe('TRAMLO');
    expect(layer.querySelector('[data-part="sticker"]')).toBeNull();
  });

  test('marks an Event of a kind nobody described with a "?" sticker', () => {
    const { layer, host } = mountAirport();
    const unknown: Partial<SourceEvent> = { archetype: null, recognised: false, kind: 'mail.received' };
    host.send(wallpaperEventFixture('fr', unknown));
    expect(layer.querySelector('[data-part="sticker"]')).not.toBeNull();
  });

  test('shows the Caption in the display language', () => {
    const { layer, host } = mountAirport({ lang: 'fr' });
    host.send(wallpaperEventFixture('fr', FOREIGN));
    expect(partText(layer, 'caption-fact')).toBe('Pull request mergée');
    expect(partText(layer, 'caption-detail')).toBe('#418 Corrige la connexion Google');
  });

  test('holds the Caption 2.5 s after the Gag, then removes the Gag and its Caption', () => {
    const { layer, host } = mountAirport();
    host.send(wallpaperEventFixture('fr', FOREIGN));
    host.clock.advance(GENERIC_GAG_MS);
    expect(layer.querySelector('[data-part="freight"]')).toBeNull();
    host.clock.advance(CAPTION_HOLD_MS - 1);
    expect(layer.querySelector('[data-part="caption"]')).not.toBeNull();
    host.clock.advance(1);
    expect(layer.querySelector('[data-part="caption"]')).toBeNull();
  });

  test('plays Events one after another, never two Gags at once, each Caption keeping its late glance', () => {
    const { layer, host } = mountAirport({ lang: 'en' });
    host.send(wallpaperEventFixture('en', FOREIGN));
    host.send(wallpaperEventFixture('en', { source: 'Mail', archetype: null }));
    expect(layer.querySelectorAll('[data-part="freight"]')).toHaveLength(1);
    expect(partText(layer, 'caption-source')).toBe('Tramlo');

    host.clock.advance(GENERIC_GAG_MS);
    const sources = Array.from(layer.querySelectorAll('[data-part="caption-source"]'), (node) => node.textContent);
    expect(layer.querySelectorAll('[data-part="freight"]')).toHaveLength(1);
    expect(sources).toEqual(['Tramlo', 'Mail']);

    host.clock.advance(CAPTION_HOLD_MS);
    expect(partText(layer, 'caption-source')).toBe('Mail');
  });

  test('holds a still pose under reduced motion', () => {
    const { layer, host } = mountAirport({ reducedMotion: true });
    host.send(wallpaperEventFixture('fr', FOREIGN));
    const freight = layer.querySelector<HTMLElement>('[data-part="freight"]');
    const first = freight?.style.transform;
    host.clock.advance(GENERIC_GAG_MS / 2);
    expect(freight?.style.transform).toBe(first);
    expect(Number(freight?.style.opacity)).toBe(1);
  });

  test('moves the tug in when motion is allowed', () => {
    const { layer, host } = mountAirport();
    host.send(wallpaperEventFixture('fr', FOREIGN));
    const freight = layer.querySelector<HTMLElement>('[data-part="freight"]');
    const first = freight?.style.transform;
    host.clock.advance(GENERIC_GAG_MS / 2);
    expect(freight?.style.transform).not.toBe(first);
  });

  test('redraws the moving tug on every other frame of the fake Clock, 30 times per second at most', () => {
    const { layer, host } = mountAirport();
    host.send(wallpaperEventFixture('fr', FOREIGN));
    const freight = layer.querySelector<HTMLElement>('[data-part="freight"]');
    const poses = new Set<string>();
    const frames = 60;
    for (let frame = 0; frame < frames; frame++) {
      host.clock.advance(FRAME_MS);
      poses.add(freight?.style.transform ?? '');
    }
    expect(poses.size).toBe(frames / 2);
  });

  test('leaves nothing behind once unmounted, even mid-Gag', () => {
    const { layer, host } = mountAirport();
    host.send(wallpaperEventFixture('fr', FOREIGN));
    unmount?.();
    unmount = undefined;
    expect(layer.childElementCount).toBe(0);
    host.send(wallpaperEventFixture('fr', FOREIGN));
    expect(() => host.clock.advance(10_000)).not.toThrow();
    expect(layer.childElementCount).toBe(0);
  });
});
