import type { ConnectorFetch } from './connector-fetch.ts';
import type { SourceSettings } from './poll.ts';

/** One option a Connector loaded for a field: the value kept in the Source's settings, and what the person reads. */
export interface ConnectorOption {
  readonly value: string;
  /** The name the service shows, which is also what a person would have typed by hand. */
  readonly label: string;
}

/** What a Connector's `listOptions` receives. */
export interface OptionsInput {
  /** The key of the field whose options are asked for. */
  readonly field: string;
  /** What the person filled in so far: the token, and at least the fields this one needs. */
  readonly settings: SourceSettings;
  readonly fetch: ConnectorFetch;
  /** The current time from the platform's Clock, in milliseconds since the Unix epoch. */
  readonly now: number;
}
