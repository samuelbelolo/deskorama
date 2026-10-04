import type { Language } from '@deskorama/core';
import { BrowserWindow, type Display } from 'electron';
import { join } from 'node:path';
import { screenSetupQuery } from '../shared/screen-setup-query.ts';
import { screenOfDisplay } from './screen-of-display.ts';

/** A wallpaper window, and when its page has loaded and listens to the main process. */
export interface WallpaperWindow {
  readonly window: BrowserWindow;
  readonly loaded: Promise<void>;
}

/**
 * Opens the wallpaper window of one display: at the desktop level, between the system wallpaper and the icons
 * (`type: 'desktop'`, checked on macOS 27), on every Space but not over full-screen apps, transparent
 * to the mouse so the icons stay clickable. Its renderer runs the Theme with context isolation, a sandbox and no
 * Node; it may not navigate nor open windows. `seed` seeds the Theme's random generator.
 * @example
 * const { window, loaded } = openWallpaperWindow(screen.getPrimaryDisplay(), 'fr', 7);
 * await loaded; // the page listens: Events sent from now on reach it
 */
export function openWallpaperWindow(display: Display, lang: Language, seed: number): WallpaperWindow {
  const window = new BrowserWindow({
    type: 'desktop',
    ...display.bounds,
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

  const loaded = window
    .loadFile(join(__dirname, '../renderer/index.html'), {
      query: screenSetupQuery({ screen: screenOfDisplay(display), lang, seed }),
    })
    // A page that fails to load is waited for no longer: the app runs on without it.
    .catch(() => undefined);

  return { window, loaded };
}
