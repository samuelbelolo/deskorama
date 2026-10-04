import { FAKE_SCREEN } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { createImmeuble } from '../src/create-immeuble.ts';
import { AFTERNOON } from './instants.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { rootOf } from './root-of.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

describe('createImmeuble', () => {
  test('is named for the settings and the demo', () => {
    expect(createImmeuble().name).toBe('immeuble');
  });

  test('draws one root the size of its screen, in the display language, with a description for screen readers', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const root = rootOf(mounted.layer);

    expect(root.style.width).toBe('1440px');
    expect(root.style.height).toBe('900px');
    expect(root.lang).toBe('en');
    expect(root.querySelector('canvas')?.width).toBe(360);
    expect(root.querySelector('.immeuble-description')?.textContent).toMatch(/Paris/);
  });

  test('fills a taller, wider screen on whole tiles: more sky above, a neighbour on the right', () => {
    const screen = { ...FAKE_SCREEN, width: 1512, height: 982 };
    mounted = mountBuilding({ start: AFTERNOON, screen, screens: [screen] });
    const canvas = rootOf(mounted.layer).querySelector('canvas');

    expect(canvas?.width).toBe(378);
    expect(canvas?.height).toBe(246);
  });

  test('unmounting removes the root and gives every sign’s home back', () => {
    mounted = mountBuilding({ start: AFTERNOON });
    const { host, layer } = mounted;
    const board = { x: 0, y: 660, w: 240, h: 120 };
    expect(host.freeSpot({ w: 60, h: 60, within: board })).toBeNull();

    mounted.unmount();
    mounted = undefined;

    expect(layer.querySelector('[data-theme="immeuble"]')).toBeNull();
    expect(host.freeSpot({ w: 60, h: 60, within: board })).not.toBeNull();
    expect(() => host.clock.advance(5000)).not.toThrow();
  });

  test('two mounts on one page keep to themselves', () => {
    const first = mountBuilding({ lang: 'fr', start: AFTERNOON });
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    first.unmount();

    expect(document.querySelectorAll('[data-theme="immeuble"]')).toHaveLength(1);
    expect(() => mounted?.host.clock.advance(2000)).not.toThrow();
  });
});
