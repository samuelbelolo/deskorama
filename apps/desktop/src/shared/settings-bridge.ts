import type { PreferencesChange } from './preferences.ts';
import type { LoginItemState, SettingsSnapshot } from './settings-snapshot.ts';
import type { OptionsAnswer, SaveAnswer, SourceDraft, TestAnswer } from './source-draft.ts';
import type { TestEventChoice } from './test-event-choice.ts';

/** The IPC channels of the settings window, each answered by the main process. */
export const SETTINGS_CHANNELS = {
  load: 'settings:load',
  save: 'settings:save',
  remove: 'settings:remove',
  test: 'settings:test',
  listOptions: 'settings:list-options',
  preferences: 'settings:preferences',
  openAtLogin: 'settings:open-at-login',
  playTest: 'settings:play-test',
  openTokenPage: 'settings:open-token-page',
  copy: 'settings:copy',
  revealSecret: 'settings:reveal-secret',
  webhookOn: 'settings:webhook-on',
  regenerateSecret: 'settings:regenerate-secret',
  changed: 'settings:changed',
} as const;

/** What the window may ask the main process to put on the clipboard; the page itself has no clipboard access. */
export const COPY_CHOICES = ['webhook-address', 'webhook-secret', 'webhook-example'] as const;

/** One thing the window may copy. */
export type CopyChoice = (typeof COPY_CHOICES)[number];

/**
 * Everything the settings window may ask of the main process, exposed by its preload as `window.settings`. Tokens
 * only travel from the window to the main process, which keeps them in the Keychain: none is ever sent back. The
 * Local webhook's secret reaches the page only when the person asks to see it.
 */
export interface SettingsBridge {
  load(): Promise<SettingsSnapshot>;
  save(draft: SourceDraft): Promise<SaveAnswer>;
  remove(id: string): Promise<void>;
  test(draft: SourceDraft): Promise<TestAnswer>;
  /**
   * Loads the options of one field of a draft, with the token it holds or, for an edited Source that keeps its own,
   * the one in the Keychain. Nothing is saved.
   */
  listOptions(draft: SourceDraft, field: string): Promise<OptionsAnswer>;
  /** Changes the Theme, the language, the brand Source or the Sources feeding the Gauges. */
  setPreferences(change: PreferencesChange): Promise<void>;
  /** Asks macOS to open the app at login, or not any more, and answers what macOS now reports. */
  setOpenAtLogin(on: boolean): Promise<LoginItemState>;
  /** Plays one test Event on the wallpaper. */
  playTest(choice: TestEventChoice): Promise<void>;
  /** Opens, in the browser, the page where a Connector's token is created, given what the sheet's fields hold. */
  openTokenPage(connector: string, values: Readonly<Record<string, string>>): Promise<void>;
  /** Puts the Local webhook's address, its secret, or a working `curl` with the secret on the clipboard. */
  copy(choice: CopyChoice): Promise<void>;
  /** Answers the Local webhook's secret, to show it. */
  revealSecret(): Promise<string>;
  /** Turns the Local webhook on or off, and keeps that choice. */
  setWebhookOn(on: boolean): Promise<void>;
  /** Draws a new secret for the Local webhook: scripts holding the old one are turned away. */
  regenerateSecret(): Promise<void>;
  /** Calls `listener` whenever a Source's state, the wallpaper's setup or the Local webhook changes, until cancelled. */
  onChanged(listener: (snapshot: SettingsSnapshot) => void): () => void;
}
