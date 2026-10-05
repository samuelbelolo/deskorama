import type {
  ConnectorAbout,
  ConnectorCard,
  ConnectorField,
  ConnectorPermission,
  GaugeRole,
  IntervalBounds,
  Language,
  SourceProfile,
} from '@deskorama/core';
import type { LanguageChoice } from './preferences.ts';
import type { SeenEvent } from './seen-event.ts';
import type { SourceStatus } from './source-status.ts';
import type { ShippedThemeId } from './theme-choice.ts';

/** A Connector as the settings window shows it: everything comes from the Connector's own package. */
export interface ConnectorView {
  readonly id: string;
  readonly title: Readonly<Record<Language, string>>;
  readonly about: ConnectorAbout;
  readonly fields: readonly ConnectorField[];
  readonly permissions: readonly ConnectorPermission[];
  /** How often its Sources may be polled, in milliseconds. */
  readonly interval: IntervalBounds;
  /** What its Sources count for each Gauge. */
  readonly gauges: SourceProfile['gauges'];
}

/** A connected Source as the settings window shows it: never its token. */
export interface SourceView {
  readonly id: string;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** The values of its fields that hold several, by key; left out when it has none. */
  readonly lists?: Readonly<Record<string, readonly string[]>> | undefined;
  /** The polling interval the person chose, in milliseconds; null for the Connector's default. */
  readonly interval: number | null;
  readonly status: SourceStatus;
  /** The last Event it sent since the app started, in the display language; null when it sent none yet. */
  readonly last: SeenEvent | null;
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

/** The Local webhook as the settings window shows it: never its secret, which is revealed on demand. */
export interface WebhookView {
  /** Whether the person keeps it turned on. */
  readonly on: boolean;
  /** False while it is off, or when its port was taken. */
  readonly listening: boolean;
  /** The loopback address scripts post to. */
  readonly address: string;
  /** A one-line `curl` that posts a test Event, with `$DESKORAMA_SECRET` standing for the secret. */
  readonly example: string;
  /** False when the secret comes from the environment, where the app cannot change it. */
  readonly canRegenerate: boolean;
  /** The latest Events it accepted since the app started, newest first, in the display language. */
  readonly recent: readonly SeenEvent[];
  readonly about: ConnectorCard;
}

/** The Connectors and the connected Sources. */
export interface SourcesSnapshot {
  readonly connectors: readonly ConnectorView[];
  readonly sources: readonly SourceView[];
}

/** What the settings window shows, in the display language. */
export interface SettingsSnapshot extends SourcesSnapshot {
  readonly lang: Language;
  /** The language the Mac itself would pick, named next to that choice. */
  readonly systemLang: Language;
  /** The time the snapshot was taken, in milliseconds since the Unix epoch, to say how long ago an Event came. */
  readonly now: number;
  /** The Mac's accent colour as `#rrggbb`, or null to keep the window's default blue. */
  readonly accent: string | null;
  readonly wallpaper: WallpaperView;
  readonly webhook: WebhookView;
}
