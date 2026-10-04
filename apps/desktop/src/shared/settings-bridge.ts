import type { ConnectorField, ConnectorPermission, Language } from '@deskorama/core';
import type { SourceStatus } from './source-status.ts';

/** The IPC channels of the settings window, each answered by the main process. */
export const SETTINGS_CHANNELS = {
  load: 'settings:load',
  save: 'settings:save',
  remove: 'settings:remove',
  test: 'settings:test',
  changed: 'settings:changed',
} as const;

/** A Connector as the settings window shows it. */
export interface ConnectorView {
  readonly id: string;
  readonly title: Readonly<Record<Language, string>>;
  readonly fields: readonly ConnectorField[];
  readonly permissions: readonly ConnectorPermission[];
}

/** A connected Source as the settings window shows it: never its token. */
export interface SourceView {
  readonly id: string;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  readonly status: SourceStatus;
}

/** What the settings window shows. */
export interface SettingsSnapshot {
  readonly connectors: readonly ConnectorView[];
  readonly sources: readonly SourceView[];
}

/** A Source being added (no id) or edited, as the form holds it. */
export interface SourceDraft {
  readonly id: string | null;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** Empty when editing keeps the token already in the Keychain. */
  readonly token: string;
}

/** The fields of a draft that need fixing: "name", "token", or a Connector field's key. */
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
  /** Calls `listener` whenever a Source's state changes, until cancelled. */
  onChanged(listener: (snapshot: SettingsSnapshot) => void): () => void;
}
