import type { Cancel } from './clock.ts';
import { createFixedInstance } from './create-fixed-instance.ts';
import { createRouter } from './create-router.ts';
import { createScreenInstances } from './create-screen-instances.ts';
import { createScreenMounts } from './create-screen-mounts.ts';
import { createScreenView, type ScreenView } from './create-screen-view.ts';
import { createSharedState } from './create-shared-state.ts';
import type { GaugeValues } from './gauge-values.ts';
import type { Host } from './host.ts';
import type { Language } from './language.ts';
import { localiseEvent } from './localise-event.ts';
import { localiseSource } from './localise-source.ts';
import { createRandom } from './random.ts';
import type { Screen } from './screen.ts';
import type { ScreenLayers } from './screen-layers.ts';
import type { SharedSnapshot } from './shared-snapshot.ts';
import type { SourceEvent } from './source-event.ts';
import type { SourceProfile } from './source-profile.ts';
import type { Theme } from './theme.ts';

/** How long the wallpaper must stay hidden for its return to bring a recap, unless the options say otherwise. */
const RECAP_AFTER_MS = 120_000;

/** Mixed into the seed for the generator that picks each Event's screen, apart from the Themes' generator. */
const ROUTING_SALT = 0x5bd1e995;

/**
 * The engine: turns Connector output into what each screen's Theme receives. A platform mounts with `mountScreens`
 * and gets routing between screens. One that draws every screen from one place (the demo) mounts the Theme itself;
 * one that draws each screen in a page of its own (the desktop app's windows) mounts a Theme that carries what its
 * screen is handed to that page, where a screen player plays it, and carries the shared state to every page.
 */
export interface Engine {
  /** Mounts `theme` on the host's first screen and returns what unmounts it; throws when there is no screen. */
  mount<Layer>(theme: Theme<Layer>, layer: Layer): Cancel;
  /** Mounts one instance of `theme` per connected screen, following screen changes live, until cancelled. */
  mountScreens<Layer>(theme: Theme<Layer>, layers: ScreenLayers<Layer>): Cancel;
  /** Takes an Event into account and plays it, in the display language, where it belongs; a replay is ignored. */
  send(event: SourceEvent): void;
  /** Sets the Gauge values a Source reported; roles left out keep their value. */
  setGauges(values: Partial<GaugeValues>): void;
  /** What every screen shares right now: the Gauges, today's tally and the recent Events. */
  state(): SharedSnapshot;
  /**
   * Calls `listener` with what every screen shares whenever it changes, until cancelled: before the Event that
   * changed it plays, so a page told of both shows the new counts when the Gag starts.
   */
  onState(listener: (state: SharedSnapshot) => void): Cancel;
}

/** How an engine is set up. */
export interface EngineOptions {
  /** The display language the engine hands to every screen. */
  readonly lang: Language;
  /** Seed of the random generator handed to the Themes. */
  readonly seed: number;
  /** The Source that names the scene and labels its Gauges. */
  readonly source: SourceProfile;
  /** The IANA time zone in which "today" starts at midnight; the system's when left out. */
  readonly timeZone?: string;
  /**
   * How long, in milliseconds, the wallpaper must stay hidden for its return to bring a recap: two minutes when left
   * out, so a window maximised for a moment brings no recap and what it hid simply plays when the wallpaper shows.
   */
  readonly recapAfter?: number;
}

/**
 * Returns an engine. It never touches a drawing surface: it builds each screen's host API, hands the layers through
 * to the Theme, and plays each new Event in the display language on one screen drawn by visible area, or on every
 * screen for a deploy. Gauges, today's counts and the recent Events are kept once and shared by every screen.
 * @example
 * const engine = createEngine(host, { lang: 'fr', seed: 7, source: tramlo });
 * const unmount = engine.mountScreens(createAeroport(), { open: addStage, close: removeStage });
 * engine.setGauges({ crowd: 4, daily: 23, total: 37 });
 * engine.send(mergedPullRequest); // one screen's Theme plays the Gag with "Pull request mergée"
 * unmount();
 */
export function createEngine(host: Host, options: EngineOptions): Engine {
  const random = createRandom(options.seed);
  const source = localiseSource(options.source, options.lang);
  const shared = createSharedState(host.clock, options.timeZone);

  const router = createRouter({
    clock: host.clock,
    random: createRandom(options.seed ^ ROUTING_SALT),
    recapAfter: options.recapAfter ?? RECAP_AFTER_MS,
  });

  const lifecycle = {
    open(screen: Screen): ScreenView {
      const view = createScreenView({ platform: host, screen, lang: options.lang, random, source, shared });
      router.add(view);

      return view;
    },
    close(view: ScreenView): void {
      view.dispose();
      router.remove(view);
    },
  };

  const mounts = createScreenMounts(host, router);

  return {
    mount<Layer>(theme: Theme<Layer>, layer: Layer): Cancel {
      const screen = host.screens()[0];

      if (screen === undefined) throw new Error('The host reports no screen to mount the Theme on.');

      // The first screen as it is now, kept for good: a page that draws one screen never follows the others.
      return mounts.track(createFixedInstance(theme, layer, screen, lifecycle));
    },
    mountScreens: (theme, layers) => mounts.track(createScreenInstances(theme, layers, lifecycle)),
    send(event: SourceEvent): void {
      const localised = localiseEvent(event, options.lang);

      if (shared.accept(localised)) router.send(localised);
    },
    setGauges: shared.setGauges,
    state: shared.snapshot,
    onState: (listener) => shared.onChange(() => listener(shared.snapshot())),
  };
}
