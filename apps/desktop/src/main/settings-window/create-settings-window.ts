import { nativeTheme, type BrowserWindow } from 'electron';
import { SETTINGS_CHANNELS } from '../../shared/settings-bridge.ts';
import { openSettingsWindow } from './open-settings-window.ts';
import { registerSettingsIpc, type SettingsActions } from './register-settings-ipc.ts';

/** The settings window, opened on demand from the menu bar. */
export interface SettingsWindow {
  /** Opens the window, or brings it forward when it is open. */
  open(): void;
  /** Sends the open window what it shows now, after a Source's state or the wallpaper's setup changed. */
  refresh(): void;
  /** Stops answering the settings page. */
  stop(): void;
}

/**
 * Returns the settings window: it answers its page's requests with `actions`, from that page only, and keeps the
 * page up to date while it is open. macOS does not announce a new accent colour, so the page is also refreshed
 * whenever the window comes forward and whenever the Mac's appearance changes.
 * @example
 * const settings = createSettingsWindow(actions);
 * settings.open(); // the window opens, or comes forward when it is open
 */
export function createSettingsWindow(actions: SettingsActions): SettingsWindow {
  let window: BrowserWindow | null = null;

  const unregister = registerSettingsIpc(actions, () => window);

  const refresh = (): void => {
    if (window !== null && !window.isDestroyed()) {
      window.webContents.send(SETTINGS_CHANNELS.changed, actions.snapshot());
    }
  };

  nativeTheme.on('updated', refresh);

  return {
    open() {
      const opened = openSettingsWindow(window);

      if (opened === window) return;

      window = opened;
      opened.on('focus', refresh);
      opened.once('closed', () => (window = null));
    },

    refresh,

    stop() {
      nativeTheme.off('updated', refresh);
      unregister();
    },
  };
}
