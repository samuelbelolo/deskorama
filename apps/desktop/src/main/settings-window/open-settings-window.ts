import { BrowserWindow } from 'electron';
import { join } from 'node:path';

/**
 * Brings the settings window forward when `current` is still open, or opens it, and returns it. Its page runs with
 * context isolation, a sandbox and no Node, reaches the main process only through `window.settings`, and may not
 * navigate nor open windows; it titles itself in the display language it reads from the main process.
 * @example
 * settingsWindow = openSettingsWindow(settingsWindow); // a second call brings the same window forward
 */
export function openSettingsWindow(current: BrowserWindow | null): BrowserWindow {
  if (current !== null && !current.isDestroyed()) {
    current.show();
    current.focus();

    return current;
  }

  const window = new BrowserWindow({
    width: 640,
    height: 720,
    minWidth: 520,
    minHeight: 480,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/settings-preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.once('ready-to-show', () => window.show());

  void window.loadFile(join(__dirname, '../renderer/settings/index.html'));

  return window;
}
