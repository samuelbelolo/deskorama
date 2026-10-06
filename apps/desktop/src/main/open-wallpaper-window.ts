import type { Host } from '@deskorama/core';
import { BrowserWindow } from 'electron';
import { join } from 'node:path';
import type { ScreenSetup } from '../shared/screen-setup.ts';
import { screenSetupQuery } from '../shared/screen-setup-query.ts';
import { DRAWN_CHANNEL } from '../shared/wallpaper-bridge.ts';
import { fadeWindow } from './fade-window.ts';
import { createPageOutbox } from './wallpapers/create-page-outbox.ts';
import type { WallpaperPort } from './wallpapers/wallpaper-port.ts';
import { writeLog } from './write-log.ts';

/** How long a wallpaper window takes to appear over the system wallpaper. */
const APPEAR_MS = 400;

/** How long a page may take to say its scene is drawn before the main process logs that it has not. */
const DRAWN_WITHIN_MS = 10_000;

/**
 * Opens the wallpaper window of one screen, at that screen's bounds: at the desktop level, between the system
 * wallpaper and the icons (`type: 'desktop'`, checked on macOS 27), on every Space but not over full-screen apps,
 * transparent to the mouse so the icons stay clickable. Its renderer plays the Theme with context isolation, a
 * sandbox and no Node; it may not navigate nor open windows. What is sent while its page loads reaches it once it
 * listens. The window stays fully transparent until its page says its scene is drawn, then fades in over the system
 * wallpaper: a page still loading never shows as a blank rectangle, and one that never draws leaves the system
 * wallpaper in sight, with a line in the log. The window never moves: when its display does, it is closed and
 * another is opened.
 * @example
 * const port = openWallpaperWindow({ screen, screens: [screen], scene: scene.scene(), seed: 7 }, host);
 * port.send(EVENT_CHANNEL, toWireEvent(event)); // the page plays it, as soon as it has loaded
 * port.close(); // the display was unplugged
 */
export function openWallpaperWindow(setup: ScreenSetup, host: Pick<Host, 'clock' | 'reducedMotion'>): WallpaperPort {
  const { x, y, width, height } = setup.screen;

  const window = new BrowserWindow({
    type: 'desktop',
    x,
    y,
    width,
    height,
    frame: false,
    show: false,
    hasShadow: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      backgroundThrottling: true,
      spellcheck: false,
    },
  });

  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  window.setIgnoreMouseEvents(true);

  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  window.setOpacity(0);
  window.once('ready-to-show', () => window.showInactive());

  // A page that fails stays unseen rather than blank: the log is then the only trace of it.
  const stopWaiting = host.clock.after(DRAWN_WITHIN_MS, () => {
    writeLog('wallpaper', `screen ${setup.screen.id}: no scene drawn after 10 s, its window stays transparent`);
  });

  // Only this window's own page can say so, and all it earns is its window's fade.
  window.webContents.ipc.once(DRAWN_CHANNEL, () => {
    stopWaiting();
    fadeWindow(window, host, { to: 1, ms: APPEAR_MS });
  });

  const outbox = createPageOutbox((channel, payload) => {
    if (!window.isDestroyed()) window.webContents.send(channel, payload);
  });

  window
    .loadFile(join(__dirname, '../renderer/index.html'), { query: screenSetupQuery(setup) })
    // A page that fails to load, or whose window closed first, is sent nothing: the app runs on without it.
    .then(
      () => outbox.open(),
      () => outbox.drop(),
    );

  return {
    send: (channel, payload) => outbox.send(channel, payload),
    close() {
      outbox.drop();
      stopWaiting();

      if (window.isDestroyed()) return;

      // Transparent first: a window whose page is torn down would show its blank background for a moment.
      window.setOpacity(0);
      window.destroy();
    },
  };
}
