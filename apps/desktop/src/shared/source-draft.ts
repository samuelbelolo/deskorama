import type { ConnectorFailure, ConnectorOption, GaugeRole } from '@deskorama/core';
import type { SeenEvent } from './seen-event.ts';
import type { SourceStatus } from './source-status.ts';

/** A Source being added (no id) or edited, as the connection sheet holds it. */
export interface SourceDraft {
  readonly id: string | null;
  readonly connector: string;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** The values of the fields that hold several, by key; left out when the Connector has no such field. */
  readonly lists?: Readonly<Record<string, readonly string[]>> | undefined;
  /** Empty when editing keeps the token already in the Keychain. */
  readonly token: string;
  /** The polling interval in milliseconds, or null for the Connector's default. */
  readonly interval: number | null;
}

/** The fields of a draft that need fixing: "name", "token", "interval", or a Connector field's key. */
export type DraftProblems = readonly string[];

/**
 * The answer to a draft with no field to fix: the Source it edits was removed meanwhile, or the app no longer knows
 * its Connector.
 */
export interface DraftGone {
  readonly ok: false;
  readonly gone: 'source' | 'connector';
}

/** The answer to saving a draft: saved, the fields to fix, or that what it was about is gone. */
export type SaveAnswer = { readonly ok: true } | { readonly ok: false; readonly problems: DraftProblems } | DraftGone;

/** What a test poll read: the latest Events, newest first, and the Gauge values the Source reported, if any. */
export interface TestFindings {
  readonly events: readonly SeenEvent[];
  readonly gauges: Readonly<Partial<Record<GaugeRole, number>>>;
}

/**
 * The answer to testing a draft: what it read, the fields to fix, that what it was about is gone, or why the
 * service refused.
 */
export type TestAnswer =
  | ({ readonly ok: true } & TestFindings)
  | { readonly ok: false; readonly problems: DraftProblems }
  | DraftGone
  | { readonly ok: false; readonly problems: readonly []; readonly status: SourceStatus };

/**
 * The answer to loading the options of one field of a draft: the options, why the service refused to list them, or
 * that the app no longer knows the draft's Connector.
 */
export type OptionsAnswer =
  | { readonly ok: true; readonly options: readonly ConnectorOption[] }
  | { readonly ok: false; readonly failure: ConnectorFailure }
  | DraftGone;
