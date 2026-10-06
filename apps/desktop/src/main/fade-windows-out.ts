import type { Host } from '@deskorama/core';
import { fadeWindow, type FadingWindow } from './fade-window.ts';

/** How long the app's windows take to disappear when it quits: short, so quitting still feels immediate. */
const LEAVE_MS = 250;

/**
 * Fades every window out together, each from the opacity it has, and calls `done` once all are transparent, at
 * once when there is none: the app leaves the desktop gently, and a window closed while transparent cannot flash.
 * @example
 * fadeWindowsOut(BrowserWindow.getAllWindows(), host, () => app.quit());
 */
export function fadeWindowsOut(
  windows: readonly FadingWindow[],
  host: Pick<Host, 'clock' | 'reducedMotion'>,
  done: () => void,
): void {
  let left = windows.length;

  if (left === 0) {
    done();

    return;
  }

  for (const window of windows) {
    fadeWindow(window, host, { to: 0, ms: LEAVE_MS }, () => {
      left -= 1;

      if (left === 0) done();
    });
  }
}
