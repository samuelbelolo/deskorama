import type { Screen } from '@deskorama/core';
import { createFakeScreenHost, FAKE_SCREEN } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { createImmeuble } from '../src/create-immeuble.ts';
import { crowdShare } from '../src/crowd-share.ts';
import { AFTERNOON } from './instants.ts';
import { rootOf } from './root-of.ts';
import { signText } from './sign-text.ts';

/** The external screen, right of the MacBook: the next building along the street. */
const EXTERNAL: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };

/** The glow of the sun's sprite, a colour nothing else in the sky shows between 8:00 and 17:30. */
const SUN_GLOW = [0xfc, 0xe7, 0xa1] as const;

const unmounts: (() => void)[] = [];

afterEach(() => {
  for (const unmount of unmounts.splice(0)) unmount();
  document.body.replaceChildren();
});

/**
 * Mounts L'Immeuble on each screen of a row, each with its own fake host, all with the same Gauges and hour.
 * @example
 * const [builtin, external] = mountRow([FAKE_SCREEN, EXTERNAL], { crowd: 9 });
 */
function mountRow(screens: readonly Screen[], crowd: number, start = AFTERNOON): HTMLElement[] {
  return screens.map((screen) => {
    const layer = document.createElement('div');
    document.body.append(layer);
    const host = createFakeScreenHost({ lang: 'fr', start, screen, screens });
    unmounts.push(createImmeuble().mount(layer, host));
    host.setGauges({ crowd, daily: 23, total: 37 });

    return layer;
  });
}

/**
 * Returns how many pixels of the sun's glow a screen's sky shows.
 * @example
 * sunPixels(layer); // 14 when the sun stands over this screen, 0 otherwise
 */
function sunPixels(layer: HTMLElement): number {
  const canvas = layer.querySelector('canvas');
  const data = canvas?.getContext('2d')?.getImageData(0, 0, canvas.width, 60).data ?? new Uint8ClampedArray();
  let count = 0;
  for (let i = 0; i < data.length; i += 4)
    if (data[i] === SUN_GLOW[0] && data[i + 1] === SUN_GLOW[1] && data[i + 2] === SUN_GLOW[2]) count += 1;

  return count;
}

describe('the next building along the street, on the external screen', () => {
  test('is a different building: twelve wide flats, the LED panel and the painted wall, no hall', () => {
    const [, external] = mountRow([FAKE_SCREEN, EXTERNAL], 9);
    const layer = external ?? document.body;

    expect(signText(layer, 'board')).toBe('SUR TRAMLO ACTIFS 9 COMMITS 23');
    expect(signText(layer, 'poster')).toBe('ISSUES 37 ISSUES OUVERTES');
    expect(signText(layer, 'hall')).toBeNull();
    expect(signText(layer, 'site')).toBe('30 JOURS SANS ACCIDENT DE MISE EN LIGNE');
  });

  test('takes its share of the residents: the two buildings house the crowd together', () => {
    for (const crowd of [0, 1, 9, 14, 41]) {
      const layers = mountRow([FAKE_SCREEN, EXTERNAL], crowd);
      const housed = layers.map((layer) => Number(rootOf(layer).dataset['tenants']));

      expect({ crowd, housed: (housed[0] ?? 0) + (housed[1] ?? 0) }).toEqual({ crowd, housed: crowd });
      expect(housed[1]).toBeLessThanOrEqual(12);
      for (const unmount of unmounts.splice(0)) unmount();
    }
  });

  test('splits the crowd the same way on every screen, whole people only', () => {
    expect(crowdShare(9, FAKE_SCREEN, [FAKE_SCREEN, EXTERNAL])).toBe(7);
    expect(crowdShare(9, EXTERNAL, [FAKE_SCREEN, EXTERNAL])).toBe(2);
    expect(crowdShare(9, FAKE_SCREEN, [FAKE_SCREEN])).toBe(9);
  });

  test('shares one sky: the sun crosses both screens once, drawn only on the one it stands over', () => {
    for (const hour of [8, 9, 14, 16]) {
      const layers = mountRow([FAKE_SCREEN, EXTERNAL], 4, new Date(2026, 9, 4, hour).getTime());
      const shown = layers.map((layer) => sunPixels(layer) > 0);

      expect({ hour, suns: shown.filter(Boolean).length }).toEqual({ hour, suns: 1 });
      for (const unmount of unmounts.splice(0)) unmount();
    }
  });

  test('the sun moves from the building’s sky to the next one’s as the day goes on', () => {
    const morning = mountRow([FAKE_SCREEN, EXTERNAL], 4, new Date(2026, 9, 4, 8).getTime());
    expect(morning.map((layer) => sunPixels(layer) > 0)).toEqual([true, false]);
    for (const unmount of unmounts.splice(0)) unmount();

    const afternoon = mountRow([FAKE_SCREEN, EXTERNAL], 4, new Date(2026, 9, 4, 16).getTime());
    expect(afternoon.map((layer) => sunPixels(layer) > 0)).toEqual([false, true]);
  });
});
