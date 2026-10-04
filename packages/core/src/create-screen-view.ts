import type { Cancel } from './clock.ts';
import { createListeners } from './create-listeners.ts';
import { createScreenClock } from './create-screen-clock.ts';
import type { SharedState } from './create-shared-state.ts';
import { createVisibleMap } from './create-visible-map.ts';
import type { GaugeValues } from './gauge-values.ts';
import type { Host } from './host.ts';
import type { Language } from './language.ts';
import type { Random } from './random.ts';
import type { Recap } from './recap.ts';
import type { Rect } from './rect.ts';
import type { Screen } from './screen.ts';
import type { ScreenHost } from './screen-host.ts';
import type { SourceInfo } from './source-info.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** One mounted screen as the engine drives it. */
export interface ScreenView {
  /** What the Theme of this screen receives. */
  readonly host: ScreenHost;
  /** Hands an Event to this screen's Theme. */
  deliver(event: WallpaperEvent): void;
  /** Hands the recap of what was missed to this screen's Theme. */
  recap(recap: Recap): void;
  /** Tells this screen's Theme the screens were rearranged. */
  arrange(screens: readonly Screen[]): void;
  /** Recomputes the visible regions from new window frames, in desktop coordinates, and tells the Theme. */
  follow(frames: readonly Rect[]): void;
  /** How many pixels of this screen's wallpaper are visible. */
  visibleArea(): number;
  /** True while windows cover the whole screen. */
  isHidden(): boolean;
  /** True while the Theme listens for recaps, so one sent here is drawn. */
  hearsRecaps(): boolean;
  /** Forgets every listener, timer and frame the Theme left behind. */
  dispose(): void;
}

/** What a screen view is built from. */
export interface ScreenViewParts {
  readonly platform: Host;
  readonly screen: Screen;
  readonly lang: Language;
  readonly random: Random;
  readonly source: SourceInfo;
  readonly shared: SharedState;
}

/**
 * Returns the view of one screen: its visible map starts from the platform's current window frames and follows the
 * frames the engine hands it, its Clock stops frames while the screen is hidden, and its host API reads the shared
 * Gauges and tally.
 * @example
 * const view = createScreenView({ platform: host, screen, lang: 'fr', random, source, shared });
 * const unmount = theme.mount(layer, view.host);
 * view.follow([{ x: 0, y: 0, w: 720, h: 900 }]);
 * view.visibleArea(); // 648000: half of a 1440 x 900 screen
 * view.deliver(event); // the Theme's onEvent listeners receive it
 */
export function createScreenView(parts: ScreenViewParts): ScreenView {
  const { platform, screen, shared } = parts;

  const clock = createScreenClock(platform.clock);
  const map = createVisibleMap(screen, platform.clock, parts.random);

  const events = createListeners<WallpaperEvent>();
  const gauges = createListeners<GaugeValues>();
  const visibility = createListeners<number>();
  const recaps = createListeners<Recap>();
  const arrangements = createListeners<readonly Screen[]>();

  const redraw = (frames: readonly Rect[]): void => {
    map.update(frames);
    clock.setHidden(map.isHidden());
  };

  redraw(platform.windowFrames());

  const stops: Cancel[] = [shared.onGauges(gauges.emit)];

  const host: ScreenHost = {
    lang: parts.lang,
    screen,
    screens: () => platform.screens(),
    onScreens: arrangements.add,
    clock,
    random: parts.random,
    reducedMotion: platform.reducedMotion,
    source: parts.source,
    onEvent: events.add,
    gauges: shared.gauges,
    onGauges: gauges.add,
    today: shared.today,
    recent: shared.recent,
    onVisibility: visibility.add,
    onRecap: recaps.add,
    visibleFraction: map.visibleFraction,
    largestFree: map.largestFree,
    freeSpot: map.freeSpot,
    reserve: map.reserve,
    isHidden: map.isHidden,
  };

  return {
    host,
    deliver: events.emit,
    recap: recaps.emit,
    arrange: arrangements.emit,
    follow(frames) {
      redraw(frames);
      visibility.emit(map.visibleFraction());
    },
    visibleArea: () => map.visibleFraction() * screen.width * screen.height,
    isHidden: map.isHidden,
    hearsRecaps: () => recaps.size() > 0,
    dispose() {
      for (const stop of stops) stop();
      for (const listeners of [events, gauges, visibility, recaps, arrangements]) listeners.clear();
      clock.dispose();
    },
  };
}
