import type { GaugeValues, Recap, Screen } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { FRAME_MS } from '../src/create-fake-clock.ts';
import { createFakeScreenHost } from '../src/create-fake-screen-host.ts';
import { wallpaperEventFixture } from '../src/wallpaper-event-fixture.ts';

describe('the fake screen host', () => {
  test('defaults to French on a MacBook screen at the desktop’s origin, with Tramlo’s Gauge labels', () => {
    const host = createFakeScreenHost();

    expect(host.lang).toBe('fr');
    expect(host.screen).toEqual({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 });
    expect(host.source.gauges.crowd).toEqual({
      label: 'Contributeurs actifs sur la dernière heure',
      short: 'ACTIFS',
      max: 14,
    });
  });

  test('delivers sent Events to listeners until they cancel, and keeps them among the recent ones', () => {
    const host = createFakeScreenHost({ lang: 'en' });
    const labels: string[] = [];

    const cancel = host.onEvent((event) => labels.push(event.label));
    host.send(wallpaperEventFixture('en'));
    cancel();
    host.send(wallpaperEventFixture('en', { id: 'second' }));

    expect(labels).toEqual(['Pull request merged']);
    expect(host.recent().map((event) => event.id)).toEqual(['second', 'tramlo-pr-418-merged']);
  });

  test('keeps the recent Events within the engine’s bounds', () => {
    const host = createFakeScreenHost({ lang: 'en' });

    for (let index = 0; index < 45; index += 1) host.send(wallpaperEventFixture('en', { id: `e${index}` }));

    expect(host.recent()).toHaveLength(12);
    expect(host.recent(100)).toHaveLength(40);
    expect(host.recent(-1)).toEqual([]);
  });

  test('moves the Gauges a test sets and tells the listeners', () => {
    const host = createFakeScreenHost();
    const heard: GaugeValues[] = [];

    host.onGauges((values) => heard.push(values));
    host.setGauges({ daily: 23, build: 'building' });

    expect(host.gauges()).toEqual({ crowd: 0, daily: 23, total: 0, build: 'building' });
    expect(heard).toHaveLength(1);
  });

  test('computes its visible regions from the windows a test moves', () => {
    const host = createFakeScreenHost();
    const heard: number[] = [];

    host.onVisibility((fraction) => heard.push(fraction));
    host.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);

    expect(host.visibleFraction()).toBe(0.5);
    expect(heard).toEqual([0.5]);
    expect(host.freeSpot({ w: 200, h: 120 })?.x).toBeGreaterThanOrEqual(720);

    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);

    expect(host.isHidden()).toBe(true);
  });

  test('stops display frames while the screen is hidden, keeps timers, and resumes frames when it shows', () => {
    const host = createFakeScreenHost();
    let frames = 0;
    let timers = 0;

    host.clock.onFrame(() => {
      frames += 1;
    });
    host.clock.after(2 * FRAME_MS, () => {
      timers += 1;
    });
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.clock.advance(2 * FRAME_MS);

    expect(frames).toBe(0);
    expect(timers).toBe(1);

    host.setWindowFrames([]);
    host.clock.advance(2 * FRAME_MS);

    expect(frames).toBe(2);
  });

  test('runs on another screen at its own size, and tells the Theme when the screens are rearranged', () => {
    const external: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };
    const builtin: Screen = { id: 'builtin', x: 0, y: 0, width: 1440, height: 900 };
    const host = createFakeScreenHost({ screen: external });
    const heard: string[][] = [];

    host.onScreens((screens) => heard.push(screens.map((screen) => screen.id)));
    host.setScreens([builtin, external]);

    expect(host.screens()).toEqual([builtin, external]);
    expect(heard).toEqual([['builtin', 'external']]);
    expect(host.largestFree()).toEqual({ x: 0, y: 0, w: 1600, h: 900 });
  });

  test('delivers recaps to listeners until they cancel', () => {
    const host = createFakeScreenHost({ lang: 'en' });
    const event = wallpaperEventFixture('en');
    const recap: Recap = {
      from: new Date(0),
      to: new Date(7_200_000),
      total: 3,
      groups: [{ archetype: 'approval', rarity: 'notable', count: 3, latest: event }],
      more: 0,
    };
    const heard: Recap[] = [];

    const cancel = host.onRecap((each) => heard.push(each));
    host.sendRecap(recap);
    cancel();
    host.sendRecap(recap);

    expect(heard).toEqual([recap]);
  });
});
