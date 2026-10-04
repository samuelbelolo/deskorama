import { ARCHETYPES } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { gagBoxes } from './gag-boxes.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';
import { roleEvent } from './role-event.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** Every Role a Gag plays for; the deploy plays its PROD flight instead. */
const ROLES = ARCHETYPES.filter((role) => role !== 'deploy');

describe("L'Aéroport behind the demo's default windows", () => {
  test.each(ROLES)('%s plays at once, inside visible space', (role) => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    host.clock.advance(300);
    host.send(roleEvent('fr', role, '+1'));
    host.clock.advance(1000);

    expect(layer.querySelector('[data-gag]')).not.toBeNull();
    expect(gagBoxes(layer).filter((box) => host.visibleFraction(box) < 1)).toEqual([]);
  });
});
