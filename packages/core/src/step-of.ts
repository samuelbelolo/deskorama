import type { DeployStep } from './deploy-step.ts';
import { isDescribedDeploy } from './is-described-deploy.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * Returns the deploy step an Event carries, or undefined when it is not a deploy its Source described: a step sent
 * with another Role, or with a kind nobody described, moves no build Gauge and plays like any other Event.
 * @example
 * stepOf(deployFailed); // "failed"
 * stepOf({ ...errorRaised, meta: { detail: '', tag: '', step: 'failed' } }); // undefined
 */
export function stepOf(event: WallpaperEvent): DeployStep | undefined {
  return isDescribedDeploy(event) ? event.meta.step : undefined;
}
