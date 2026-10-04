import type { ScreenView } from './create-screen-view.ts';
import { goesEverywhere } from './goes-everywhere.ts';
import { pickWeighted } from './pick-weighted.ts';
import type { Random } from './random.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Plays an Event on every screen for a deploy, otherwise on one screen drawn in proportion to its visible wallpaper.
 * @example
 * routeEvent(new Set([builtinView, externalView]), random, merged); // one of the two screens plays it
 */
export function routeEvent(views: ReadonlySet<ScreenView>, random: Random, event: WallpaperEvent): void {
  if (goesEverywhere(event)) {
    for (const view of views) view.deliver(event);

    return;
  }

  const candidates = Array.from(views);

  const index = pickWeighted(
    candidates.map((view) => view.visibleArea()),
    random,
  );

  candidates[index]?.deliver(event);
}
