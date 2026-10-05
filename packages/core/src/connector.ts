import type { ConnectorAbout } from './connector-about.ts';
import type { ConnectorConfig } from './connector-config.ts';
import type { Language } from './language.ts';
import type { PollInput, PollResult } from './poll.ts';
import type { SourceProfile } from './source-profile.ts';

/**
 * Reads one kind of Source by polling it from the Mac: how it presents itself, what a person fills in to connect it,
 * the words of its Gauges, and `poll`. A Connector never reaches the network itself, never reads the time, and never keeps state
 * between polls: everything it needs to resume travels in its cursor. `poll` throws only a `ConnectorError`.
 */
export interface Connector {
  /** A stable identifier, stored with each Source, e.g. "feed". */
  readonly id: string;
  /** Its name in the settings window. */
  readonly title: Readonly<Record<Language, string>>;
  /** Its logo, what it brings and where its token is created, for the settings window. */
  readonly about: ConnectorAbout;
  readonly config: ConnectorConfig;
  /** The words of the Source's Gauges in every display language. */
  readonly gauges: SourceProfile['gauges'];
  poll(input: PollInput): Promise<PollResult>;
}
