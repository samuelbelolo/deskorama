import { afterEach, describe, expect, test } from 'vitest';
import { SIGNS_SETTLE_MS } from '../src/create-signs.ts';
import { layoutFor } from '../src/layout.ts';
import { boxOf } from './box-of.ts';
import { intersects } from './intersects.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/**
 * Returns the text of one part of the scene, or null when it is not drawn.
 * @example
 * partText(layer, 'sign-daily-value'); // "23"
 */
function partText(layer: HTMLElement, part: string): string | null {
  return layer.querySelector(`[data-part="${part}"]`)?.textContent ?? null;
}

describe("L'Aéroport's signs", () => {
  test('show each Gauge with the Source’s own word, the airport’s word for the role, and its value', () => {
    mounted = mountAirport({ lang: 'fr' });
    mounted.host.setGauges({ crowd: 4, daily: 23, total: 37 });
    const { layer } = mounted;
    expect(partText(layer, 'sign-crowd')).toBe('ACTIFSEN CE MOMENT4');
    expect(partText(layer, 'sign-daily')).toBe('COMMITSAUJOURD’HUI23');
    expect(partText(layer, 'sign-total')).toBe('ISSUESAU TOTAL37');
    expect(layer.querySelector<HTMLElement>('[data-part="sign-crowd"]')?.title).toBe(
      'Contributeurs actifs sur la dernière heure',
    );
  });

  test('show the build state in the display language, in orange once a deploy failed', () => {
    mounted = mountAirport({ lang: 'en' });
    const { layer, host } = mounted;
    const deploy = layer.querySelector('[data-part="sign-build"]');
    expect(partText(layer, 'sign-build')).toBe('DEPLOYRUNWAY 09CLEAR');
    host.setGauges({ build: 'building' });
    expect(partText(layer, 'sign-build-value')).toBe('RUNNING');
    expect(deploy?.classList.contains('aeroport-sign--news')).toBe(false);
    host.setGauges({ build: 'ready' });
    expect(partText(layer, 'sign-build-value')).toBe('SHIPPED');
    expect(deploy?.classList.contains('aeroport-sign--news')).toBe(false);
    host.setGauges({ build: 'error' });
    expect(partText(layer, 'sign-build-value')).toBe('FAILED');
    expect(deploy?.classList.contains('aeroport-sign--news')).toBe(true);
  });

  test('stand above the Dock along the bottom edge, fully visible at home', () => {
    const screen = { id: 'builtin', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 };
    mounted = mountAirport({ screen });
    const { layer, host } = mounted;

    host.setWindowFrames([
      { x: 0, y: 0, w: 1728, h: 33 },
      { x: 0, y: 1042, w: 1728, h: 75 },
    ]);
    host.clock.advance(SIGNS_SETTLE_MS);

    const signs = boxOf(layer, '[data-part="signs"]');
    expect(signs).toMatchObject({ x: 24, y: 954 });
    expect(signs === null ? 0 : host.visibleFraction(signs)).toBe(1);
  });

  test('share the lifted ground with a tower that stays under the Departures board', () => {
    const tall = layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 });
    const lifted = layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900, bottomInset: 75 });

    expect(tall.tower).toMatchObject({ cabTop: 300, cabBottom: 372 });
    expect(lifted.groundEnd).toBe(780);
    expect(lifted.runwayBand.y + lifted.runwayBand.h).toBe(780);
    expect(lifted.tower.cabTop).toBeGreaterThanOrEqual(lifted.board.y + lifted.board.h + 10);
    expect(lifted.tower.cabBottom).toBeLessThan(lifted.horizon);
  });

  test('reserve their spot, so no free spot lands on them', () => {
    mounted = mountAirport();
    const { layer, host } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 780 }]);
    host.clock.advance(SIGNS_SETTLE_MS);
    const signs = boxOf(layer, '[data-part="signs"]');
    const spot = host.freeSpot({ w: 120, h: 120, near: { x: 0, y: 840 } });
    expect(signs).not.toBeNull();
    expect(spot !== null && signs !== null && intersects(spot, signs)).toBe(false);
  });

  test('move to visible ground once the windows covering their home settle', () => {
    mounted = mountAirport();
    const { layer, host } = mounted;
    host.setWindowFrames([{ x: 0, y: 600, w: 700, h: 300 }]);
    host.clock.advance(SIGNS_SETTLE_MS - 1);
    expect(boxOf(layer, '[data-part="signs"]')?.x).toBe(24);
    host.clock.advance(1);
    const signs = boxOf(layer, '[data-part="signs"]');
    expect(signs === null ? 0 : host.visibleFraction(signs)).toBe(1);
  });
});
