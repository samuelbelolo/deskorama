import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron';
import * as v from 'valibot';
import { SETTINGS_CHANNELS, type SourceDraft } from '../../shared/settings-bridge.ts';
import type { SettingsService } from './create-settings-service.ts';

/** The id of the Source to remove. */
const SOURCE_ID = v.pipe(v.string(), v.nonEmpty(), v.maxLength(100));

/** A draft as it arrives from the settings page: checked before anything reads it. */
const DRAFT: v.GenericSchema<unknown, SourceDraft> = v.strictObject({
  id: v.nullable(v.pipe(v.string(), v.maxLength(100))),
  connector: v.pipe(v.string(), v.maxLength(100)),
  name: v.pipe(v.string(), v.maxLength(200)),
  values: v.record(v.pipe(v.string(), v.maxLength(100)), v.pipe(v.string(), v.maxLength(2000))),
  token: v.pipe(v.string(), v.maxLength(8000)),
});

/**
 * Answers the settings page's requests with `service`, and only those of the settings window's own page: any other
 * sender, or a payload of the wrong shape, is refused. Returns what removes the handlers.
 * @example
 * const unregister = registerSettingsIpc(service, () => settingsWindow);
 */
export function registerSettingsIpc(service: SettingsService, settingsWindow: () => BrowserWindow | null): () => void {
  const handlers: Readonly<Record<string, (payload: unknown) => unknown>> = {
    [SETTINGS_CHANNELS.load]: () => service.snapshot(),
    [SETTINGS_CHANNELS.save]: (payload) => service.save(v.parse(DRAFT, payload)),
    [SETTINGS_CHANNELS.test]: (payload) => service.test(v.parse(DRAFT, payload)),
    [SETTINGS_CHANNELS.remove]: (payload) => service.remove(v.parse(SOURCE_ID, payload)),
  };

  for (const [channel, handle] of Object.entries(handlers)) {
    ipcMain.handle(channel, (event, payload: unknown) => {
      if (!isSettingsPage(event, settingsWindow())) throw new Error('Refused: not the settings window.');

      return handle(payload);
    });
  }

  return () => {
    for (const channel of Object.keys(handlers)) ipcMain.removeHandler(channel);
  };
}

/**
 * Returns true when a request comes from the settings window's own page, not from a frame inside it nor from
 * another window: the sender is that window and the frame has no parent. The frame is read at once: Electron
 * returns null for it once the page has navigated away.
 * @example
 * isSettingsPage(event, settingsWindow); // true for the settings page's own requests
 */
function isSettingsPage(event: IpcMainInvokeEvent, window: BrowserWindow | null): boolean {
  const frame = event.senderFrame;

  return window !== null && !window.isDestroyed() && event.sender === window.webContents && frame?.parent === null;
}
