import type { ConnectorField } from './connector-field.ts';
import type { Language } from './language.ts';

/** A permission the token needs, named the way the service names it, so an error can say which one is missing. */
export interface ConnectorPermission {
  readonly name: string;
  /** Why the Connector needs it, in each language. */
  readonly why: Readonly<Record<Language, string>>;
}

/** How often a Connector may poll, in milliseconds. */
export interface IntervalBounds {
  /** Never sooner, to stay within the service's limits. */
  readonly min: number;
  readonly default: number;
  /** Never later, so the wallpaper stays alive. */
  readonly max: number;
}

/** What a person fills in to connect a Source, and how often the Connector polls it. */
export interface ConnectorConfig {
  readonly fields: readonly ConnectorField[];
  /** The permissions to grant the token: the settings window lists them, read-only wherever the service allows. */
  readonly permissions: readonly ConnectorPermission[];
  readonly interval: IntervalBounds;
}
