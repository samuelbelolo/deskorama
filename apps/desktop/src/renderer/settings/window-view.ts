import type { PreferencesChange } from '../../shared/preferences.ts';
import type { ConnectorView, SettingsSnapshot, SourceView } from '../../shared/settings-snapshot.ts';
import type { PaneId } from './pane-id.ts';

/** What the window shows that the main process does not decide. */
export interface WindowView {
  readonly snapshot: SettingsSnapshot;
  readonly pane: PaneId;
  /** Which picture of the Themes the Wallpaper pane shows. */
  readonly time: 'day' | 'night';
  /** The Local webhook's secret while the person has it shown; null while it is masked. */
  readonly secret: string | null;
  /** True once a new secret was asked for and could not be drawn, until the person leaves the pane or tries again. */
  readonly regenerateFailed: boolean;
  /** What the Try pane last played, said under its list; empty before the first test. */
  readonly played: string;
}

/**
 * What the panes may ask of the window. A change the main process refuses draws the window again as it stands, so a
 * control never keeps showing what was refused.
 */
export interface WindowActions {
  readonly go: (pane: PaneId) => void;
  /** Opens the connection sheet for a new Source of a Connector. */
  readonly connect: (connector: ConnectorView) => void;
  /** Opens the connection sheet on a connected Source. */
  readonly edit: (source: SourceView) => void;
  /** Asks once more, then removes a Source. */
  readonly remove: (source: SourceView) => void;
  /** Changes the Theme, the language, the brand Source or the Sources feeding the Gauges. */
  readonly setPreferences: (change: PreferencesChange) => void;
  /** Asks macOS to open the app at login, or not any more, then shows what macOS answers. */
  readonly setOpenAtLogin: (on: boolean) => void;
  readonly setTime: (time: 'day' | 'night') => void;
  /** Turns the Local webhook on or off. */
  readonly setWebhookOn: (on: boolean) => void;
  /** Shows the Local webhook's secret, or masks it again. */
  readonly toggleSecret: () => void;
  /** Asks once more, then draws a new secret for the Local webhook. */
  readonly regenerateSecret: () => void;
  /** Remembers what the Try pane just played, for when it is drawn again; the pane itself says it at once. */
  readonly setPlayed: (played: string) => void;
}
