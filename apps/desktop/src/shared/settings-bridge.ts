import type { ConnectorField, ConnectorPermission, GaugeRole, IntervalBounds, Language } from '@deskorama/core';
import type { LanguageChoice, PreferencesChange } from './preferences.ts';
import type { SourceStatus } from './source-status.ts';
import type { TestEventChoice } from './test-event-choice.ts';
import type { ShippedThemeId } from './theme-choice.ts';

/** The IPC channels of the settings window, each answered by the main process. */
export const SETTINGS_CHANNELS = {
  load: 'settings:load',
  save: 'settings:save',
  remove: 'settings:remove',
  test: 'settings:test',
  preferences: 'settings:preferences',
  openAtLogin: 'settings:open-at-login',
  playTest: 'settings:play-test',
  changed: 'settings:changed',
} as const;

/** A Connector as the settings window shows it. */
export interface ConnectorView {
  readonly id: string;
  readonly title: Readonly<Record<Language, string>>;
  readonly fields: readonly ConnectorField[];
  readonly permissions: readonly ConnectorPermission[];
  /** How often its Sources may be polled, in milliseconds. */
  readonly interval: IntervalBounds;
}

/** A connected Source as the settings window shows it: never its token. */
export interface SourceView {
  readonly id: string;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** The polling interval the person chose, in milliseconds; null for the Connector's default. */
  readonly interval: number | null;
  readonly status: SourceStatus;
}

/** Whether the app opens at login, as macOS reports it. */
export interface LoginItemState {
  readonly on: boolean;
  /** True when macOS waits for the person to allow it in System Settings › General › Login Items. */
  readonly needsApproval: boolean;
}

/** How the wallpaper is set up, as the settings window shows it. */
export interface WallpaperView {
  readonly theme: ShippedThemeId;
  readonly language: LanguageChoice;
  /** The id of the Source that names the scene now, or null without any Source. */
  readonly brand: string | null;
  /** By Gauge role, the id of the connected Source the person picked for it, or null when it follows the brand. */
  readonly gauges: Readonly<Record<GaugeRole, string | null>>;
  readonly login: LoginItemState;
}

/** The Connectors and the connected Sources. */
export interface SourcesSnapshot {
  readonly connectors: readonly ConnectorView[];
  readonly sources: readonly SourceView[];
}

/** What the settings window shows, in the display language. */
export interface SettingsSnapshot extends SourcesSnapshot {
  readonly lang: Language;
  readonly wallpaper: WallpaperView;
}

/** A Source being added (no id) or edited, as the form holds it. */
export interface SourceDraft {
  readonly id: string | null;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** Empty when editing keeps the token already in the Keychain. */
  readonly token: string;
  /** The polling interval in milliseconds, or null for the Connector's default. */
  readonly interval: number | null;
}

/** The fields of a draft that need fixing: "name", "token", "interval", or a Connector field's key. */
export type DraftProblems = readonly string[];

/** The answer to saving a draft. */
export type SaveAnswer = { readonly ok: true } | { readonly ok: false; readonly problems: DraftProblems };

/** One Event a test poll returned, in the display language. */
interface TestedEvent {
  readonly label: string;
  readonly detail: string;
  readonly at: number;
}

/** The answer to testing a draft: its latest Events, or why it failed. */
export type TestAnswer =
  | { readonly ok: true; readonly events: readonly TestedEvent[] }
  | { readonly ok: false; readonly problems: DraftProblems }
  | { readonly ok: false; readonly problems: readonly []; readonly status: SourceStatus };

/**
 * Everything the settings window may ask of the main process, exposed by its preload as `window.settings`. Tokens
 * only travel from the window to the main process, which keeps them in the Keychain: none is ever sent back.
 */
export interface SettingsBridge {
  load(): Promise<SettingsSnapshot>;
  save(draft: SourceDraft): Promise<SaveAnswer>;
  remove(id: string): Promise<void>;
  test(draft: SourceDraft): Promise<TestAnswer>;
  /** Changes the Theme, the language, the brand Source or the Sources feeding the Gauges. */
  setPreferences(change: PreferencesChange): Promise<void>;
  /** Asks macOS to open the app at login, or not any more, and answers what macOS now reports. */
  setOpenAtLogin(on: boolean): Promise<LoginItemState>;
  /** Plays one test Event on the wallpaper. */
  playTest(choice: TestEventChoice): Promise<void>;
  /** Calls `listener` whenever a Source's state or the wallpaper's setup changes, until cancelled. */
  onChanged(listener: (snapshot: SettingsSnapshot) => void): () => void;
}
