import type { Clock, Rect } from '@deskorama/core';
import { app } from 'electron';
import type { DisplaySource } from './wallpapers/display-source.ts';
import { getWindowsBinary } from './window-frames/get-windows-binary.ts';
import { readWindowFrames } from './window-frames/read-window-frames.ts';
import { watchWindowFrames, type FrameWatch } from './window-frames/watch-window-frames.ts';

/**
 * Starts reading what covers the wallpapers with get-windows (no Screen Recording permission: frames, no titles)
 * on the displays connected at each read, and hands the frames to `onFrames` whenever they change.
 * `DESKORAMA_WINDOW_FRAMES=off` ignores other apps' windows, so an end-to-end run does not depend on what the test
 * machine has open.
 * @example
 * const watch = startFrameWatch(clock, displays, (frames) => host.setWindowFrames(frames));
 * powerMonitor.on('suspend', watch.pause);
 */
export function startFrameWatch(
  clock: Clock,
  displays: DisplaySource,
  onFrames: (frames: readonly Rect[]) => void,
): FrameWatch {
  const binary = getWindowsBinary({
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    appPath: app.getAppPath(),
  });

  const ignoreWindows = process.env['DESKORAMA_WINDOW_FRAMES'] === 'off';

  return watchWindowFrames({
    clock,
    displays: () => displays.all(),
    readWindows: async () => (ignoreWindows ? [] : readWindowFrames(binary)),
    onFrames,
  });
}
