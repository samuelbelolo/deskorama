import {
  createDedupe,
  type Clock,
  type Connector,
  type ConnectorFetch,
  type GaugeValues,
  type SourceEvent,
} from '@deskorama/core';
import { createSourcePoller, type SourcePoller } from './create-source-poller.ts';
import type { CursorStore } from './cursor-store.ts';
import type { SourceEntry } from './source-entry.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import type { TokenStore } from './token-store.ts';

/** How many Event ids are remembered to drop replays: weeks of Events for a busy Source. */
const REMEMBERED_EVENTS = 5000;

/** A connected Source and where it stands. */
export interface SourceState {
  readonly entry: SourceEntry;
  readonly status: SourceStatus;
}

/** What runs the connected Sources. */
export interface SourceRuntimeOptions {
  readonly connectors: readonly Connector[];
  readonly clock: Clock;
  readonly fetch: ConnectorFetch;
  readonly tokens: TokenStore;
  readonly cursors: CursorStore;
  /** Receives each Event once, whatever the Source replays. */
  readonly onEvent: (event: SourceEvent) => void;
  readonly onGauges: (gauges: Partial<GaugeValues>) => void;
  /** Receives every Source's state whenever one changes. */
  readonly onStates: (states: readonly SourceState[]) => void;
}

/** The connected Sources, each polled by its Connector. */
export interface SourceRuntime {
  /**
   * Polls exactly these Sources from now on: the settings window calls it after every change. A Source whose
   * entry did not change keeps its poller, so its wait (a backoff, a rate limit) is not cut short.
   */
  load(entries: readonly SourceEntry[]): void;
  /**
   * Starts one Source's poller over, even when its entry did not change: after a new token, a Source stopped on
   * the old one polls again.
   */
  restart(id: string): void;
  /** Polls every Source at once, e.g. when the Mac wakes, to catch up from their cursors. */
  pollAll(): void;
  states(): readonly SourceState[];
  stop(): void;
}

/**
 * Returns the runtime of the connected Sources: one poller per Source whose Connector the app knows, a shared
 * memory of Event ids so a replayed page never plays twice, and the state of each Source for the menu bar.
 * @example
 * const runtime = createSourceRuntime({ connectors: [createFeed()], clock, fetch, tokens, cursors,
 *   onEvent: (event) => sendToWindows(windows, EVENT_CHANNEL, toWireEvent(event)), onGauges: () => {},
 *   onStates: (states) => void (latest = states) });
 * runtime.load(readSources(readSettingsFile(userData)));
 */
export function createSourceRuntime(options: SourceRuntimeOptions): SourceRuntime {
  const dedupe = createDedupe(REMEMBERED_EVENTS);
  // By Source id: the poller and the entry it polls, so a reload keeps the pollers of unchanged Sources.
  const running = new Map<string, { readonly poller: SourcePoller; readonly key: string }>();
  let states: SourceState[] = [];

  const setStatus = (id: string, status: SourceStatus): void => {
    states = states.map((state) => (state.entry.id === id ? { ...state, status } : state));

    options.onStates(states);
  };

  const stop = (): void => {
    for (const { poller } of running.values()) poller.stop();

    running.clear();
  };

  const start = (entry: SourceEntry, connector: Connector, key: string): SourcePoller =>
    createSourcePoller({
      ...options,
      entry,
      connector,
      onEvents: (events) => {
        // Ids are remembered per Source and address: another address may reuse an id for another Event.
        for (const event of events) if (dedupe.firstTime(key, event.id)) options.onEvent(event);
      },
      onStatus: (status) => setStatus(entry.id, status),
    });

  const load = (entries: readonly SourceEntry[]): void => {
    const known = entries.flatMap((entry) => {
      const connector = options.connectors.find((candidate) => candidate.id === entry.connector);

      return connector === undefined ? [] : [{ entry, connector, key: JSON.stringify(entry) }];
    });

    const previous = new Map(states.map((state) => [state.entry.id, state.status]));

    for (const [id, { poller, key }] of running) {
      if (known.some((source) => source.entry.id === id && source.key === key)) continue;

      poller.stop();
      running.delete(id);
    }

    states = known.map(({ entry }) => ({
      entry,
      status: running.has(entry.id) ? (previous.get(entry.id) ?? { state: 'waiting' }) : { state: 'waiting' },
    }));
    options.onStates(states);

    for (const { entry, connector, key } of known) {
      if (!running.has(entry.id)) running.set(entry.id, { poller: start(entry, connector, key), key });
    }
  };

  return {
    load,
    restart(id) {
      running.get(id)?.poller.stop();
      running.delete(id);

      load(states.map((state) => state.entry));
    },
    pollAll() {
      for (const { poller } of running.values()) poller.pollNow();
    },
    states: () => states,
    stop,
  };
}
