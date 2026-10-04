import type { DeployReplay } from './create-deploy-replay.ts';
import type { Missed } from './create-missed.ts';
import type { ScreenView } from './create-screen-view.ts';
import { mostVisible } from './most-visible.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** What a return to the wallpaper plays on. */
export interface RevealOptions {
  readonly views: ReadonlySet<ScreenView>;
  readonly deploys: DeployReplay;
  /** Plays an Event on the screens it belongs to. */
  readonly route: (event: WallpaperEvent) => void;
  /** How long the wallpaper must stay hidden for its return to bring a recap. */
  readonly recapAfter: number;
}

/**
 * Brings back what was missed between `from` and `to`: the recap on the most visible screen, then the deploy step
 * the scene owes once it has been read; or, after a short hide, or when that screen's Theme draws no recap, the kept
 * Events themselves. A deploy step missed during this hide supersedes the one a previous recap still owed.
 * @example
 * revealMissed(kept, hiddenSince, clock.now(), { views, deploys, route, recapAfter: 120_000 });
 */
export function revealMissed(kept: Missed, from: number, to: number, options: RevealOptions): void {
  const carried = options.deploys.take();
  const owed = kept.owedDeploy() ?? carried;

  const target = mostVisible(options.views);
  const short = to - from < options.recapAfter || target === undefined || !target.hearsRecaps();

  if (kept.isEmpty() || short) {
    replay(kept, owed, options.route);

    return;
  }

  target.recap(kept.recap(new Date(from), new Date(to)));

  if (owed !== null) options.deploys.schedule(owed);
}

/**
 * Plays what was kept as it arrived, with the owed deploy step first when it is older than the latest kept Events.
 * @example
 * replay(kept, deployFailed, route); // the failure, then the dozen latest Events
 */
function replay(kept: Missed, owed: WallpaperEvent | null, route: (event: WallpaperEvent) => void): void {
  const latest = kept.latest();

  if (owed !== null && !latest.includes(owed)) route(owed);

  for (const event of latest) route(event);
}
