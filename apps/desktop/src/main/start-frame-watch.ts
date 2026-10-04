import type { Clock, Rect } from '@deskorama/core';
import { app, screen, type BrowserWindow } from 'electron';
import { FRAMES_CHANNEL } from '../shared/wallpaper-bridge.ts';
import { sendToWindows } from './send-to-windows.ts';
import { getWindowsBinary } from './window-frames/get-windows-binary.ts';
import { readWindowFrames } from './window-frames/read-window-frames.ts';
import { watchWindowFrames, type FrameWatch } from './window-frames/watch-window-frames.ts';

/**
 * Starts reading what covers the wallpapers with get-windows (no Screen Recording permission: frames, no titles)
 * and sends the frames to every wallpaper window, including a window that finishes loading after they last changed.
 * `DESKORAMA_WINDOW_FRAMES=off` ignores other apps' windows, so an end-to-end run does not depend on what the test
 * machine has open.
 * @example
 * const watch = startFrameWatch(windows, clock);
 * powerMonitor.on('suspend', watch.pause);
 */
export function startFrameWatch(windows: readonly BrowserWindow[], clock: Clock): FrameWatch {
  const binary = getWindowsBinary({
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    appPath: app.getAppPath(),
  });

  const ignoreWindows = process.env['DESKORAMA_WINDOW_FRAMES'] === 'off';

  let latest: readonly Rect[] = [];

  for (const window of windows) {
    window.webContents.on('did-finish-load', () => window.webContents.send(FRAMES_CHANNEL, latest));
  }

  return watchWindowFrames({
    clock,
    displays: () => screen.getAllDisplays(),
    readWindows: async () => (ignoreWindows ? [] : readWindowFrames(binary)),
    onFrames: (frames) => {
      latest = frames;
      sendToWindows(windows, FRAMES_CHANNEL, frames);
    },
  });
}
