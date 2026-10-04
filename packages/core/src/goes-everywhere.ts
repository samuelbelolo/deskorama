import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Returns true for an Event every screen plays: a deploy step, the failed-deploy scene included, since production's
 * state concerns the whole desktop. Every other Event plays on one screen.
 * @example
 * goesEverywhere(deployFailed); // true
 * goesEverywhere(mergedPullRequest); // false
 */
export function goesEverywhere(event: WallpaperEvent): boolean {
  return event.archetype === 'deploy' || event.meta.step !== undefined;
}
