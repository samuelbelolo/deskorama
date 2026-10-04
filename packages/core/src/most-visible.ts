import type { ScreenView } from './create-screen-view.ts';

/**
 * Returns the screen with the most visible wallpaper, the first one on a tie, or undefined when none is mounted.
 * @example
 * mostVisible(new Set([covered, clear]))?.host.screen.id; // "external"
 */
export function mostVisible(views: ReadonlySet<ScreenView>): ScreenView | undefined {
  let best: ScreenView | undefined;

  for (const view of views) {
    if (best === undefined || view.visibleArea() > best.visibleArea()) best = view;
  }

  return best;
}
