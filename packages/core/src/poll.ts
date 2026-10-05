import type { ConnectorFetch } from './connector-fetch.ts';
import type { GaugeValues } from './gauge-values.ts';
import type { SourceEvent } from './source-event.ts';

/** What a Source's settings hold when a Connector polls it. */
export interface SourceSettings {
  /** The Source's display name, set on every Event it produces. */
  readonly name: string;
  /** The values of the Connector's fields, by key. */
  readonly values: Readonly<Record<string, string>>;
  /** The values of the fields that hold several, by key; left out by a Source that has none. */
  readonly lists?: Readonly<Record<string, readonly string[]>> | undefined;
  /** Read from the Keychain just before the poll; never stored anywhere else. */
  readonly token: string;
}

/** What a Connector's `poll` receives. */
export interface PollInput {
  readonly settings: SourceSettings;
  /** The cursor the previous poll returned, or null for the first poll and after a reset. */
  readonly cursor: string | null;
  readonly fetch: ConnectorFetch;
  /** The current time from the platform's Clock, in milliseconds since the Unix epoch. */
  readonly now: number;
}

/** What a Connector's `poll` returns. */
export interface PollResult {
  /** The Events that happened after the cursor, oldest first; a replayed Event keeps its id. */
  readonly events: readonly SourceEvent[];
  /** The Gauge values the Source reported, if any. */
  readonly gauges?: Partial<GaugeValues>;
  /** Opaque to everyone but the Connector; persisted, so the next poll resumes there, even after a restart. */
  readonly cursor: string | null;
  /** How long to wait before the next poll, kept within the Connector's interval bounds; 0 to poll again at once. */
  readonly delay?: number;
}
