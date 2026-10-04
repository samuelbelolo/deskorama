import { isDescribedDeploy } from './is-described-deploy.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Returns true for an Event every screen plays: a deploy its Source described, the failed-deploy scene included,
 * since production's state concerns the whole desktop. Every other Event plays on one screen, a deploy of a kind
 * nobody described too, since it plays the generic Gag.
 * @example
 * goesEverywhere(deployFailed); // true
 * goesEverywhere(mergedPullRequest); // false
 */
export function goesEverywhere(event: WallpaperEvent): boolean {
  return isDescribedDeploy(event);
}
