import type { Cancel, Clock } from './clock.ts';
import { createMissed, type Missed } from './create-missed.ts';
import type { ScreenView } from './create-screen-view.ts';
import { goesEverywhere } from './goes-everywhere.ts';
import { pickWeighted } from './pick-weighted.ts';
import type { Random } from './random.ts';
import type { Rect } from './rect.ts';
import type { Screen } from './screen.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** How long the recap holds the screen before a missed failed deploy plays: the time to read it. */
export const RECAP_HOLD_MS = 8000;

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
 * screen with the most visible wallpaper gets the recap, then every screen plays the missed failed deploy, unless a
 * later deploy succeeded or a new deploy step arrives first. After a shorter hide, or when that screen's Theme draws
 * no recap, the latest kept Events simply play, the missed failed deploy among them.
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
  let missed = createMissed();
  let hiddenSince: number | null = null;
  let stopReplay: Cancel | null = null;

  /** Drops the pending failed-deploy replay, if any. */
  const cancelReplay = (): void => {
    stopReplay?.();
    stopReplay = null;
  };

  /** Plays an Event on every screen for a deploy, otherwise on one screen drawn by visible area. */
  const route = (event: WallpaperEvent): void => {
    if (goesEverywhere(event)) {
      for (const view of views) view.deliver(event);
      return;
    }

    const candidates = Array.from(views);
    const index = pickWeighted(
      candidates.map((view) => view.visibleArea()),
      options.random,
    );

    candidates[index]?.deliver(event);
  };

  /** Plays what was kept as it arrived: the missed failed deploy first when it is older than the latest kept. */
  const replay = (kept: Missed): void => {
    const failed = kept.failedDeploy();
    const latest = kept.latest();

    if (failed !== null && !latest.includes(failed)) route(failed);
    for (const event of latest) route(event);
  };

  /**
   * Brings back what was missed since `since`: the recap on the most visible screen, then the missed failed deploy;
   * or the kept Events themselves after a short hide, or when that screen's Theme draws no recap.
   */
  const reveal = (since: number): void => {
    const kept = missed;
    missed = createMissed();
    if (kept.isEmpty()) return;

    const now = clock.now();
    const target = mostVisible(views);

    if (now - since < options.recapAfter || target === undefined || !target.hearsRecaps()) {
      replay(kept);
      return;
    }

    target.recap(kept.recap(new Date(since), new Date(now)));

    const failed = kept.failedDeploy();
    if (failed === null) return;

    stopReplay = clock.after(RECAP_HOLD_MS, () => {
      stopReplay = null;
      for (const view of views) view.deliver(failed);
    });
  };

  /** Notices the wallpaper becoming fully hidden, or showing again. */
  const refresh = (): void => {
    if (views.size === 0) {
      // Nothing left to show a recap on: what was missed stays counted in today's tally only.
      missed = createMissed();
      hiddenSince = null;
      cancelReplay();
      return;
    }

    const hidden = Array.from(views).every((view) => view.isHidden());

    if (hidden && hiddenSince === null) {
      hiddenSince = clock.now();
      cancelReplay();
    } else if (!hidden && hiddenSince !== null) {
      const since = hiddenSince;
      hiddenSince = null;
      reveal(since);
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
      // A newer deploy step supersedes the failure the recap was about to replay.
      if (event.meta.step !== undefined) cancelReplay();

      if (hiddenSince !== null) missed.add(event);
      else route(event);
    },
  };
}

/**
 * Returns the screen with the most visible wallpaper, the first one on a tie, or undefined when none is mounted.
 * @example
 * mostVisible(new Set([covered, clear]))?.host.screen.id; // "external"
 */
function mostVisible(views: ReadonlySet<ScreenView>): ScreenView | undefined {
  let best: ScreenView | undefined;

  for (const view of views) {
    if (best === undefined || view.visibleArea() > best.visibleArea()) best = view;
  }

  return best;
}
