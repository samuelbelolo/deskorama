import type { BrowserWindow } from 'electron';

/**
 * Sends one message to every wallpaper window still open.
 * @example
 * sendToWindows(windows, EVENT_CHANNEL, toWireEvent(event));
 */
export function sendToWindows(windows: readonly BrowserWindow[], channel: string, payload: unknown): void {
  for (const window of windows) if (!window.isDestroyed()) window.webContents.send(channel, payload);
}
