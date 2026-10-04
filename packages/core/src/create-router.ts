import type { Clock } from './clock.ts';
import { createDeployReplay } from './create-deploy-replay.ts';
import { createMissed } from './create-missed.ts';
import type { ScreenView } from './create-screen-view.ts';
import type { Random } from './random.ts';
import type { Rect } from './rect.ts';
import { revealMissed } from './reveal-missed.ts';
import { routeEvent } from './route-event.ts';
import type { Screen } from './screen.ts';
import { stepOf } from './step-of.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Keeps the mounted screens and decides which of them play each Event, and what the person missed while the
 * wallpaper was hidden. It also hands every screen the window frames and the arrangement, since visibility decides
 * routing.
 */
export interface Router {
  /** Starts routing to `view`; call {@link Router.refresh} once the screens are settled. */
  add(view: ScreenView): void;
  /** Stops routing to `view`; call {@link Router.refresh} once the screens are settled. */
  remove(view: ScreenView): void;
  /** True while at least one screen is mounted. */
  hasViews(): boolean;
  /** Hands new window frames to every screen, then notices the wallpaper hiding or showing. */
  follow(frames: readonly Rect[]): void;
  /** Tells every screen's Theme the screens were rearranged. */
  arrange(screens: readonly Screen[]): void;
  /** Notices the wallpaper hiding or showing after screens were added or removed. */
  refresh(): void;
  /** Plays an Event on the screens it belongs to, or keeps it for the recap while the wallpaper is hidden. */
  send(event: WallpaperEvent): void;
}

/** What a router needs. */
export interface RouterOptions {
  readonly clock: Clock;
  /** Draws the screen of each Event; its own generator, so routing never shifts the Themes' draws. */
  readonly random: Random;
  /** How long the wallpaper must stay hidden for its return to bring a recap. */
  readonly recapAfter: number;
}

/**
 * Returns a router. An Event plays on one screen drawn in proportion to its visible wallpaper area; a deploy plays on
 * every screen. While every screen is hidden, Events are kept: when the wallpaper shows again after `recapAfter`, the
 * screen with the most visible wallpaper gets the recap, then every screen plays the missed deploy step the scene
 * still owes (a failure, or a new deploy started), unless a newer deploy step arrives first. A wallpaper hidden again
 * before that step plays keeps it owed for the next return. After a shorter hide, or when that screen's Theme draws
 * no recap, the latest kept Events simply play, the owed deploy step among them.
 * @example
 * const router = createRouter({ clock, random: createRandom(8), recapAfter: 120_000 });
 * router.add(builtinView);
 * router.add(externalView);
 * router.refresh();
 * router.send(merged); // plays on one of the two screens, more often on the less covered one
 */
export function createRouter(options: RouterOptions): Router {
  const { clock } = options;

  const views = new Set<ScreenView>();
  const route = (event: WallpaperEvent): void => routeEvent(views, options.random, event);
  const deploys = createDeployReplay(clock, route);

  let missed = createMissed();
  let hiddenSince: number | null = null;

  /** Notices the wallpaper becoming fully hidden, or showing again. */
  const refresh = (): void => {
    if (views.size === 0) {
      // Nothing left to show a recap on: what was missed stays counted in today's tally only.
      missed = createMissed();
      hiddenSince = null;
      deploys.drop();

      return;
    }

    const hidden = Array.from(views).every((view) => view.isHidden());

    if (hidden && hiddenSince === null) {
      hiddenSince = clock.now();
      deploys.pause();
    } else if (!hidden && hiddenSince !== null) {
      const kept = missed;
      const since = hiddenSince;
      missed = createMissed();
      hiddenSince = null;

      revealMissed(kept, since, clock.now(), { views, deploys, route, recapAfter: options.recapAfter });
    }
  };

  return {
    add: (view) => void views.add(view),
    remove: (view) => void views.delete(view),
    hasViews: () => views.size > 0,
    follow(frames) {
      for (const view of views) view.follow(frames);
      refresh();
    },
    arrange(screens) {
      for (const view of views) view.arrange(screens);
    },
    refresh,
    send(event) {
      // A newer deploy step supersedes the one the recap still owed.
      if (stepOf(event) !== undefined) deploys.drop();

      if (hiddenSince !== null) missed.add(event);
      else route(event);
    },
  };
}
