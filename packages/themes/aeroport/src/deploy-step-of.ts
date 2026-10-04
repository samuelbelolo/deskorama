import type { DeployStep, WallpaperEvent } from '@deskorama/core';

/**
 * Returns the step of a deploy Event. A deploy that names no step says that something was deployed: it plays as a
 * success, the whole flight at once.
 * @example
 * deployStepOf(deployFailed); // "failed"
 * deployStepOf({ ...deployFailed, meta: { detail: 'web', tag: '' } }); // "succeeded"
 */
export function deployStepOf(event: WallpaperEvent): DeployStep {
  return event.meta.step ?? 'succeeded';
}
