import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron';
import * as v from 'valibot';
import { LANGUAGE_CHOICES, type PreferencesChange } from '../../shared/preferences.ts';
import { COPY_CHOICES, SETTINGS_CHANNELS, type CopyChoice } from '../../shared/settings-bridge.ts';
import type { LoginItemState, SettingsSnapshot } from '../../shared/settings-snapshot.ts';
import type { SaveAnswer, SourceDraft, TestAnswer } from '../../shared/source-draft.ts';
import { TEST_EVENT_CHOICES, type TestEventChoice } from '../../shared/test-event-choice.ts';
import { AVAILABLE_THEMES } from '../../shared/theme-choice.ts';
import { SOURCE_ID } from '../source-id.ts';

/** Everything the settings page may ask, answered in the main process. */
export interface SettingsActions {
  snapshot(): SettingsSnapshot;
  save(draft: SourceDraft): SaveAnswer;
  remove(id: string): void;
  test(draft: SourceDraft): Promise<TestAnswer>;
  setPreferences(change: PreferencesChange): void;
  setOpenAtLogin(on: boolean): LoginItemState;
  playTest(choice: TestEventChoice): void;
  openTokenPage(connector: string, values: Readonly<Record<string, string>>): void;
  copy(choice: CopyChoice): void;
  revealSecret(): string;
  setWebhookOn(on: boolean): Promise<void>;
  regenerateSecret(): Promise<void>;
}

/** The values of a Connector's fields, as the settings page holds them. */
const VALUES = v.record(v.pipe(v.string(), v.maxLength(100)), v.pipe(v.string(), v.maxLength(2000)));

/** A draft as it arrives from the settings page: checked before anything reads it. */
const DRAFT: v.GenericSchema<unknown, SourceDraft> = v.strictObject({
  id: v.nullable(v.pipe(v.string(), v.maxLength(100))),
  connector: v.pipe(v.string(), v.maxLength(100)),
  name: v.pipe(v.string(), v.maxLength(200)),
  values: VALUES,
  token: v.pipe(v.string(), v.maxLength(8000)),
  // Checked against the Connector's bounds with the rest of the draft, so a value out of them marks its field.
  interval: v.nullable(v.pipe(v.number(), v.integer())),
});

/** Which Connector's token page to open, with what its fields hold now: the Connector alone decides the address. */
const TOKEN_PAGE = v.strictObject({ connector: v.pipe(v.string(), v.maxLength(100)), values: VALUES });

/** The Source picked for one Gauge, or null for the brand Source. */
const GAUGE_SOURCE = v.optional(v.nullable(SOURCE_ID));

/** A change of preferences: only a Theme the app ships, a known language and Source ids. */
const PREFERENCES_CHANGE: v.GenericSchema<unknown, PreferencesChange> = v.strictObject({
  theme: v.optional(v.picklist(AVAILABLE_THEMES)),
  language: v.optional(v.picklist(LANGUAGE_CHOICES)),
  brand: v.optional(v.nullable(SOURCE_ID)),
  gauges: v.optional(v.strictObject({ crowd: GAUGE_SOURCE, daily: GAUGE_SOURCE, total: GAUGE_SOURCE })),
});

/**
 * Answers the settings page's requests with `actions`, and only those of the settings window's own page: any other
 * sender, or a payload of the wrong shape, is refused. Returns what removes the handlers.
 * @example
 * const unregister = registerSettingsIpc(actions, () => settingsWindow);
 */
export function registerSettingsIpc(actions: SettingsActions, settingsWindow: () => BrowserWindow | null): () => void {
  const handlers: Readonly<Record<string, (payload: unknown) => unknown>> = {
    [SETTINGS_CHANNELS.load]: () => actions.snapshot(),
    [SETTINGS_CHANNELS.save]: (payload) => actions.save(v.parse(DRAFT, payload)),
    [SETTINGS_CHANNELS.test]: (payload) => actions.test(v.parse(DRAFT, payload)),
    [SETTINGS_CHANNELS.remove]: (payload) => actions.remove(v.parse(SOURCE_ID, payload)),
    [SETTINGS_CHANNELS.preferences]: (payload) => actions.setPreferences(v.parse(PREFERENCES_CHANGE, payload)),
    [SETTINGS_CHANNELS.openAtLogin]: (payload) => actions.setOpenAtLogin(v.parse(v.boolean(), payload)),
    [SETTINGS_CHANNELS.playTest]: (payload) => actions.playTest(v.parse(v.picklist(TEST_EVENT_CHOICES), payload)),
    [SETTINGS_CHANNELS.openTokenPage]: (payload) => {
      const { connector, values } = v.parse(TOKEN_PAGE, payload);

      actions.openTokenPage(connector, values);
    },
    [SETTINGS_CHANNELS.copy]: (payload) => actions.copy(v.parse(v.picklist(COPY_CHOICES), payload)),
    [SETTINGS_CHANNELS.revealSecret]: () => actions.revealSecret(),
    [SETTINGS_CHANNELS.webhookOn]: (payload) => actions.setWebhookOn(v.parse(v.boolean(), payload)),
    [SETTINGS_CHANNELS.regenerateSecret]: () => actions.regenerateSecret(),
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
