import {
  createListeners,
  createRandom,
  createScreenClock,
  createVisibleMap,
  localiseSource,
  type Language,
  type Recap,
  type Rect,
  type Screen,
  type ScreenHost,
  type WallpaperEvent,
} from '@deskorama/core';
import { createFakeClock, type FakeClock } from './create-fake-clock.ts';
import { createFakeGauges, type FakeGauges } from './create-fake-gauges.ts';
import { FAKE_SCREEN } from './fake-screen.ts';
import { sourceProfileFixture } from './source-profile-fixture.ts';

/** How many Events the engine keeps among the recent ones. */
const RECENT_SIZE = 40;

/** How many recent Events a Theme gets when it does not say. */
const RECENT_DEFAULT = 12;

/**
 * The host API of one screen, driven by a test: it sends Events and recaps, sets Gauges, moves windows, rearranges
 * the screens and steps the Clock.
 */
export interface FakeScreenHost extends ScreenHost, FakeGauges {
  readonly clock: FakeClock;
  /** Delivers an Event to every listener, as the engine would, and keeps it among the recent ones. */
  send(event: WallpaperEvent): void;
  /** Delivers a recap to every listener, as the engine would when the wallpaper shows again. */
  sendRecap(recap: Recap): void;
  /**
   * Moves the windows, in the screen's pixels; visibility listeners hear the new visible fraction. While they cover
   * the whole screen, display frames stop and timers keep running, as on the engine's screens.
   */
  setWindowFrames(frames: readonly Rect[]): void;
  /** Rearranges the connected screens; arrangement listeners hear them. The Theme's own screen stays the same. */
  setScreens(screens: readonly Screen[]): void;
}

/** How a fake screen host is set up; every field has a default. */
export interface FakeScreenHostOptions {
  readonly lang?: Language;
  readonly seed?: number;
  readonly start?: number;
  readonly reducedMotion?: boolean;
  /** The screen the Theme draws on; a MacBook at the desktop's origin by default. */
  readonly screen?: Screen;
  /** Every connected screen, left to right; the Theme's own screen alone by default. */
  readonly screens?: readonly Screen[];
}

/**
 * Returns a host API for mounting a Theme without the engine: French, seed 1, a MacBook screen with no window,
 * Tramlo's Gauge labels and a fake Clock, unless told otherwise. Its visible regions are core's real 60 px grid,
 * its Clock stops frames while the screen is hidden, and `recent()` keeps the engine's bounds. It keeps no count of
 * the day: `today()` stays empty; tests of the tally go through the engine.
 * @example
 * const host = createFakeScreenHost({ lang: 'en' });
 * createAeroport().mount(layer, host);
 * host.setWindowFrames([{ x: 0, y: 0, w: 720, h: 900 }]);
 * host.visibleFraction(); // 0.5
 */
export function createFakeScreenHost(options: FakeScreenHostOptions = {}): FakeScreenHost {
  const lang = options.lang ?? 'fr';
  const screen = options.screen ?? FAKE_SCREEN;
  const time = createFakeClock(options.start ?? 0);
  const screenClock = createScreenClock(time);
  const clock: FakeClock = {
    now: () => screenClock.now(),
    after: (ms, task) => screenClock.after(ms, task),
    onFrame: (listener) => screenClock.onFrame(listener),
    advance: (ms) => time.advance(ms),
  };
  const random = createRandom(options.seed ?? 1);
  // The map reads frames in desktop coordinates; this host takes them in the screen's pixels, so it sits at 0, 0.
  const map = createVisibleMap({ ...screen, x: 0, y: 0 }, time, random);

  const events = createListeners<WallpaperEvent>();
  const visibility = createListeners<number>();
  const recaps = createListeners<Recap>();
  const screenListeners = createListeners<readonly Screen[]>();

  let screens: readonly Screen[] = options.screens ?? [screen];
  let sent: readonly WallpaperEvent[] = [];

  return {
    lang,
    screen,
    screens: () => screens,
    onScreens: screenListeners.add,
    clock,
    random,
    reducedMotion: options.reducedMotion ?? false,
    source: localiseSource(sourceProfileFixture(), lang),
    ...createFakeGauges(),
    today: () => ({ kinds: {}, roles: {}, lastDeploy: null }),
    recent: (count = RECENT_DEFAULT) => sent.slice(0, Math.max(0, count)),
    onEvent: events.add,
    onVisibility: visibility.add,
    onRecap: recaps.add,
    visibleFraction: map.visibleFraction,
    largestFree: map.largestFree,
    freeSpot: map.freeSpot,
    reserve: map.reserve,
    isHidden: map.isHidden,
    send(event) {
      sent = [event, ...sent].slice(0, RECENT_SIZE);
      events.emit(event);
    },
    sendRecap: recaps.emit,
    setWindowFrames(frames) {
      map.update(frames);
      screenClock.setHidden(map.isHidden());
      visibility.emit(map.visibleFraction());
    },
    setScreens(next) {
      screens = next;
      screenListeners.emit(next);
    },
  };
}
