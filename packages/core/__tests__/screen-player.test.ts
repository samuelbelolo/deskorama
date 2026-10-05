import { describe, expect, test } from 'vitest';
import { createEngine } from '../src/create-engine.ts';
import { createScreenPlayer } from '../src/create-screen-player.ts';
import { localiseEvent } from '../src/localise-event.ts';
import type { Recap } from '../src/recap.ts';
import type { ScreenHost } from '../src/screen-host.ts';
import type { WallpaperEvent } from '../src/wallpaper-event.ts';
import { BUILTIN, createManualHost, EXTERNAL, START } from './manual-host.ts';
import { TRAMLO, tramloEvent } from './tramlo.ts';

const HOUR = 3_600_000;

const MERGED = localiseEvent(tramloEvent(), 'en');

/**
 * Mounts a recording Theme on the external screen of a two-screen desktop through a player counting days in UTC.
 * @example
 * const { player, seen } = playing();
 * player.play(MERGED);
 * seen.events; // [MERGED]
 */
function playing() {
  const platform = createManualHost({ screens: [BUILTIN, EXTERNAL] });
  const player = createScreenPlayer(platform, {
    screen: EXTERNAL,
    lang: 'en',
    seed: 7,
    source: TRAMLO,
    timeZone: 'UTC',
  });
  const seen = { events: [] as WallpaperEvent[], recaps: [] as Recap[], unmounted: false };
  let mounted: ScreenHost | undefined;

  const unmount = player.mount(
    {
      name: 'recording',
      mount(_layer: string, host) {
        mounted = host;
        host.onEvent((event) => seen.events.push(event));
        host.onRecap((recap) => seen.recaps.push(recap));

        return () => {
          seen.unmounted = true;
        };
      },
    },
    'layer',
  );

  if (mounted === undefined) throw new Error('The player mounted no Theme.');

  return { platform, player, seen, host: mounted, unmount };
}

/**
 * Returns what an engine shares after it counted five active people and `count` merged pull requests.
 * @example
 * stateAfter(2).today.roles.approval; // 2
 */
function stateAfter(count: number) {
  const engine = createEngine(createManualHost(), { lang: 'en', seed: 1, source: TRAMLO, timeZone: 'UTC' });

  engine.setGauges({ crowd: 5 });
  for (let index = 0; index < count; index += 1) {
    engine.send(tramloEvent({ id: `pr-${index}`, gauge: { role: 'daily', by: 1 } }));
  }

  return engine.state();
}

describe('the player of one screen', () => {
  test('mounts the Theme on its own screen, among its neighbours, in the engine’s language', () => {
    const { host } = playing();

    expect(host.screen).toEqual(EXTERNAL);
    expect(host.screens()).toEqual([BUILTIN, EXTERNAL]);
    expect(host.lang).toBe('en');
    expect(host.source.gauges.crowd.short).toBe('ACTIVE');
  });

  test('plays the Events and the recap it receives, and counts nothing by itself', () => {
    const { player, seen, host } = playing();
    const recap: Recap = { from: new Date(START), to: new Date(START + HOUR), total: 1, groups: [], more: 0 };

    player.play(MERGED);
    player.play(MERGED);
    player.recap(recap);

    expect(seen.events).toEqual([MERGED, MERGED]);
    expect(seen.recaps).toEqual([recap]);
    expect(host.today().roles).toEqual({});
    expect(host.recent()).toEqual([]);
  });

  test('shows the Gauges, today’s tally and the recent Events of the engine, and tells the Theme of new Gauges', () => {
    const { player, host } = playing();
    const heard: number[] = [];
    host.onGauges((gauges) => heard.push(gauges.daily));

    player.setState(stateAfter(2));
    player.setState(stateAfter(3));

    expect(host.gauges()).toEqual({ crowd: 5, daily: 3, total: 0, build: 'idle' });
    expect(host.today().roles).toEqual({ approval: 3 });
    expect(host.recent().map((event) => event.id)).toEqual(['pr-2', 'pr-1', 'pr-0']);
    expect(heard).toEqual([2, 3]);
  });

  test('starts a new day at midnight by itself, until the engine says more', () => {
    const { platform, player, host } = playing();
    player.setState(stateAfter(2));

    platform.advance(10 * HOUR);

    expect(host.today().roles).toEqual({});
    expect(host.gauges()).toMatchObject({ crowd: 5, daily: 0 });
    expect(host.recent()).toHaveLength(2);
  });

  test('counts a state read yesterday as yesterday’s', () => {
    const { platform, player, host } = playing();
    const yesterday = stateAfter(2);

    platform.advance(10 * HOUR);
    player.setState(yesterday);

    expect(host.today().roles).toEqual({});
    expect(host.gauges().daily).toBe(0);
  });

  test('stops drawing while its own screen is covered, whatever the others show', () => {
    const { platform, host } = playing();
    const fractions: number[] = [];
    host.onVisibility((fraction) => fractions.push(fraction));
    host.clock.onFrame(() => {});

    platform.setWindowFrames([{ x: EXTERNAL.x, y: 0, w: EXTERNAL.width, h: EXTERNAL.height }]);

    expect(host.isHidden()).toBe(true);
    expect(fractions).toEqual([0]);
    expect(platform.frameSubscriptions()).toBe(0);

    platform.setWindowFrames([{ x: 0, y: 0, w: BUILTIN.width, h: BUILTIN.height }]);

    expect(host.isHidden()).toBe(false);
    expect(platform.frameSubscriptions()).toBe(1);
  });

  test('tells the Theme when the screens are rearranged, and stays on its own screen', () => {
    const { platform, host, seen } = playing();
    const heard: string[][] = [];
    host.onScreens((screens) => heard.push(screens.map((screen) => screen.id)));

    platform.setScreens([EXTERNAL]);

    expect(heard).toEqual([['external']]);
    expect(host.screens()).toEqual([EXTERNAL]);
    expect(seen.unmounted).toBe(false);
  });

  test('lets go of the platform once its Theme is unmounted', () => {
    const { platform, player, seen, unmount } = playing();

    unmount();
    player.play(MERGED);

    expect(seen.unmounted).toBe(true);
    expect(seen.events).toEqual([]);
    expect(platform.frameFollowers()).toBe(0);
    expect(platform.screenFollowers()).toBe(0);
  });
});
