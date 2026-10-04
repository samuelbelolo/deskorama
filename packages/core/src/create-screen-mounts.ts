import type { Cancel } from './clock.ts';
import type { Router } from './create-router.ts';
import type { ScreenInstances } from './create-screen-instances.ts';
import type { Host } from './host.ts';
import type { Screen } from './screen.ts';

/** The sets of Theme instances mounted on an engine. */
export interface ScreenMounts {
  /** Mounts a set of instances on the current screens and returns what unmounts them all. */
  track(instances: ScreenInstances): Cancel;
}

/**
 * Returns the mounts of an engine. It follows the window frames and the screen arrangement only while something
 * listens, so an engine left with no Theme holds no subscription on the platform.
 * @example
 * const mounts = createScreenMounts(host, router);
 * const unmount = mounts.track(createScreenInstances(theme, layers, lifecycle));
 */
export function createScreenMounts(host: Host, router: Router): ScreenMounts {
  const mounts = new Set<ScreenInstances>();
  let stopFrames: Cancel | null = null;
  let stopScreens: Cancel | null = null;

  /** Follows a new screen arrangement: instances mounted or unmounted, then every Theme told. */
  const rearrange = (screens: readonly Screen[]): void => {
    for (const instances of mounts) instances.sync(screens);

    router.arrange(screens);
    settle();
  };

  /** Subscribes to the platform while something listens, and lets go once nothing does. */
  const settle = (): void => {
    router.refresh();

    if (router.hasViews() && stopFrames === null) stopFrames = host.onWindowFrames((frames) => router.follow(frames));
    if (!router.hasViews() && stopFrames !== null) {
      stopFrames();
      stopFrames = null;
    }

    if (mounts.size > 0 && stopScreens === null) stopScreens = host.onScreens?.(rearrange) ?? null;
    if (mounts.size === 0 && stopScreens !== null) {
      stopScreens();
      stopScreens = null;
    }
  };

  /** Unmounts a set of instances and lets go of the platform once nothing listens. */
  const untrack = (instances: ScreenInstances): void => {
    instances.clear();
    mounts.delete(instances);
    settle();
  };

  return {
    track(instances) {
      mounts.add(instances);

      try {
        instances.sync(host.screens());
      } catch (error) {
        untrack(instances);
        throw error;
      }

      settle();

      return () => untrack(instances);
    },
  };
}
