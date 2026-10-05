import { BrowserWindow } from 'electron';
import { join } from 'node:path';
import type { ScreenSetup } from '../shared/screen-setup.ts';
import { screenSetupQuery } from '../shared/screen-setup-query.ts';
import { createPageOutbox } from './wallpapers/create-page-outbox.ts';
import type { WallpaperPort } from './wallpapers/wallpaper-port.ts';

/**
 * Opens the wallpaper window of one screen, at that screen's bounds: at the desktop level, between the system
 * wallpaper and the icons (`type: 'desktop'`, checked on macOS 27), on every Space but not over full-screen apps,
 * transparent to the mouse so the icons stay clickable. Its renderer plays the Theme with context isolation, a
 * sandbox and no Node; it may not navigate nor open windows. What is sent while its page loads reaches it once it
 * listens. The window never moves: when its display does, it is closed and another is opened.
 * @example
 * const port = openWallpaperWindow({ screen, screens: [screen], scene: scene.scene(), seed: 7 });
 * port.send(EVENT_CHANNEL, toWireEvent(event)); // the page plays it, as soon as it has loaded
 * port.close(); // the display was unplugged
 */
export function openWallpaperWindow(setup: ScreenSetup): WallpaperPort {
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
  window.once('ready-to-show', () => window.showInactive());

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

      if (!window.isDestroyed()) window.destroy();
    },
  };
}
