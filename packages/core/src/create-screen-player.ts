import type { Cancel } from './clock.ts';
import { createFixedInstance } from './create-fixed-instance.ts';
import type { ViewLifecycle } from './create-screen-instances.ts';
import { createScreenMounts } from './create-screen-mounts.ts';
import { createScreenView, type ScreenView } from './create-screen-view.ts';
import { createSharedState } from './create-shared-state.ts';
import type { Host } from './host.ts';
import type { Language } from './language.ts';
import { localiseSource } from './localise-source.ts';
import { createRandom } from './random.ts';
import type { Recap } from './recap.ts';
import type { Screen } from './screen.ts';
import type { SharedSnapshot } from './shared-snapshot.ts';
import type { SourceProfile } from './source-profile.ts';
import type { Theme } from './theme.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * One screen's share of an engine, for a platform that draws each screen in a page of its own (the desktop app's
 * windows) while a single engine routes for them all. It decides nothing: it plays what that engine handed its
 * screen, and shows the state that engine shares.
 */
export interface ScreenPlayer {
  /** Mounts `theme` on the page's screen and returns what unmounts it. */
  mount<Layer>(theme: Theme<Layer>, layer: Layer): Cancel;
  /** Takes what every screen shares, as the engine keeps it now. */
  setState(state: SharedSnapshot): void;
  /** Plays an Event the engine routed to this screen. */
  play(event: WallpaperEvent): void;
  /** Shows the recap the engine sent to this screen. */
  recap(recap: Recap): void;
}

/** How a screen player is set up. */
export interface ScreenPlayerOptions {
  /** The screen this page draws, among those its host reports. */
  readonly screen: Screen;
  /** The display language of the engine that routes. */
  readonly lang: Language;
  /** Seed of the random generator handed to the Themes. */
  readonly seed: number;
  /** The Source that names the scene and labels its Gauges. */
  readonly source: SourceProfile;
  /** The IANA time zone in which "today" starts at midnight; the system's when left out. */
  readonly timeZone?: string;
}

/**
 * Returns the player of one screen. Its host reports every screen and every window frame, so the Theme knows its
 * neighbours and draws where the wallpaper can be seen; Events, recaps and the shared state only come from whoever
 * runs the engine. Between two states it starts a new day at midnight by itself, like the engine.
 * @example
 * const player = createScreenPlayer(host, { screen: external, lang: 'fr', seed: 7, source: tramlo });
 * const unmount = player.mount(createAeroport(), layer);
 * player.setState(state); // the Gauges and today's counts of the engine
 * player.play(mergedPullRequest); // the Theme plays the Gag
 */
export function createScreenPlayer(host: Host, options: ScreenPlayerOptions): ScreenPlayer {
  const random = createRandom(options.seed);
  const source = localiseSource(options.source, options.lang);
  const shared = createSharedState(host.clock, options.timeZone);
  const views = new Set<ScreenView>();

  const lifecycle: ViewLifecycle = {
    open(screen) {
      const view = createScreenView({ platform: host, screen, lang: options.lang, random, source, shared });
      views.add(view);

      return view;
    },
    close(view) {
      view.dispose();
      views.delete(view);
    },
  };

  const mounts = createScreenMounts(host, {
    hasViews: () => views.size > 0,
    follow(frames) {
      for (const view of views) view.follow(frames);
    },
    arrange(screens) {
      for (const view of views) view.arrange(screens);
    },
    // Hiding and showing are the engine's to notice: it keeps the Events and sends the recap.
    refresh() {},
  });

  return {
    mount: (theme, layer) => mounts.track(createFixedInstance(theme, layer, options.screen, lifecycle)),
    setState: shared.restore,
    play(event) {
      for (const view of views) view.deliver(event);
    },
    recap(recap) {
      for (const view of views) view.recap(recap);
    },
  };
}
