import { afterEach, describe, expect, test } from 'vitest';
import { SKY_STEP_MS } from '../src/create-time-of-day.ts';
import { AFTERNOON, NIGHT } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { roleEvent } from './role-event.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/**
 * Returns the airport's root, where the hour, the build state and the controller's pose are written.
 * @example
 * rootOf(layer).classList.contains('is-night'); // true at 3:00
 */
function rootOf(layer: HTMLElement): HTMLElement {
  const root = layer.querySelector<HTMLElement>('[data-theme="aeroport"]');
  if (root === null) throw new Error('The airport is not mounted.');

  return root;
}

describe("L'Aéroport's scene", () => {
  test('follows the hour: day colours in the afternoon, night and a sleeping controller at 3:00', () => {
    mounted = mountAirport({ start: AFTERNOON });
    const day = rootOf(mounted.layer);
    expect(day.classList.contains('is-day')).toBe(true);
    expect(day.dataset['pose']).toBe('idle');
    const afternoonSky = day.style.getPropertyValue('--sky1');
    mounted.unmount();

    mounted = mountAirport({ start: NIGHT });
    const night = rootOf(mounted.layer);
    expect(night.classList.contains('is-night')).toBe(true);
    expect(night.dataset['pose']).toBe('sleep');
    expect(night.style.getPropertyValue('--sky1')).not.toBe(afternoonSky);
  });

  test('moves on with the Clock, into the night', () => {
    mounted = mountAirport({ start: AFTERNOON });
    mounted.host.clock.advance(9 * 60 * SKY_STEP_MS);

    expect(rootOf(mounted.layer).classList.contains('is-night')).toBe(true);
  });

  test('puts the controller on watch and turns the beacon while a deploy runs', () => {
    mounted = mountAirport({ start: NIGHT });
    const { host, layer } = mounted;
    host.setGauges({ build: 'building' });
    const beam = layer.querySelector('[data-part="beam"]');
    const before = beam?.getAttribute('transform');
    host.clock.advance(500);

    expect(rootOf(layer).dataset['pose']).toBe('watch');
    expect(beam?.getAttribute('transform')).not.toBe(before);
  });

  test('lines up one passenger per person active, scaled to the Source’s busiest hour', () => {
    mounted = mountAirport({ start: AFTERNOON });
    const { host, layer } = mounted;
    host.setGauges({ crowd: 9 });
    expect(layer.querySelectorAll('[data-part="queue-person"]')).toHaveLength(9);

    host.setGauges({ crowd: 0 });
    expect(layer.querySelectorAll('[data-part="queue-person"]')).toHaveLength(0);
  });

  test('lifts the windsock with the crowd', () => {
    mounted = mountAirport({ start: AFTERNOON });
    const { host, layer } = mounted;
    const sock = layer.querySelector('[data-part="windsock"] .sock');
    host.setGauges({ crowd: 0 });
    const limp = sock?.getAttribute('transform');
    host.setGauges({ crowd: 14 });

    expect(sock?.getAttribute('transform')).not.toBe(limp);
  });

  test('throws one more suitcase on the rejected-baggage pile for each rejection', () => {
    mounted = mountAirport({ start: AFTERNOON });
    const { host, layer } = mounted;
    const pile = (): number => layer.querySelectorAll('[data-part="pile"] svg > g > g').length;
    expect(pile()).toBe(0);

    host.send(roleEvent('fr', 'rejection'));
    host.send(roleEvent('fr', 'approval'));
    expect(pile()).toBe(1);
  });

  test('keeps the board, the parked plane and the windsock free of Gags', () => {
    mounted = mountAirport({ start: AFTERNOON });
    const { host } = mounted;

    expect(host.freeSpot({ w: 60, h: 60, within: { x: 870, y: 34, w: 448, h: 246 } })).toBeNull();
    expect(host.freeSpot({ w: 60, h: 60, within: { x: 700, y: 640, w: 200, h: 100 } })).toBeNull();
    expect(host.freeSpot({ w: 60, h: 60, within: { x: 1350, y: 820, w: 90, h: 80 } })).toBeNull();
  });
});
