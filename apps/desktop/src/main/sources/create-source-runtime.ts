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
import { readsOf } from './reads-of.ts';
import type { SourceEntry } from './source-entry.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import type { TokenStore } from './token-store.ts';

/** How many Event ids are remembered to drop replays: weeks of Events for a busy Source. */
const REMEMBERED_EVENTS = 5000;

/** A connected Source, where it stands and the last Event it sent since the app started. */
export interface SourceState {
  readonly entry: SourceEntry;
  readonly status: SourceStatus;
  /** Null until the Source sends an Event; forgotten when its address changes, like its remembered Event ids. */
  readonly last: SourceEvent | null;
}

/** What runs the connected Sources. */
export interface SourceRuntimeOptions {
  readonly connectors: readonly Connector[];
  readonly clock: Clock;
  readonly fetch: ConnectorFetch;
  readonly tokens: TokenStore;
  readonly cursors: CursorStore;
  /** Receives each Event once, whatever the Source replays, with the id of its Source. */
  readonly onEvent: (event: SourceEvent, sourceId: string) => void;
  /** Receives the Gauge values a Source reported, with the id of that Source. */
  readonly onGauges: (sourceId: string, gauges: Partial<GaugeValues>) => void;
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
   * Starts one Source's poller over, even when its entry did not change: after a new token or a permission fixed on
   * the service's side, a Source stopped until then polls again.
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
 *   onEvent: (event, sourceId) => stage.send(scene.fromSource(sourceId, event)),
 *   onGauges: (sourceId, gauges) => scene.setGauges(sourceId, gauges),
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

  const start = (entry: SourceEntry, connector: Connector): SourcePoller => {
    // Ids are remembered per Source and address: another address may reuse an id for another Event, while a new
    // name or interval polls the same Events again.
    const address = addressOf(entry, connector);

    return createSourcePoller({
      ...options,
      entry,
      connector,
      onEvents: (events) => {
        const fresh = events.filter((event) => dedupe.firstTime(address, event.id));

        for (const event of fresh) options.onEvent(event, entry.id);

        // Kept without telling anyone yet: the poller reports its status right after, which carries it along.
        const last = fresh.at(-1);

        if (last !== undefined)
          states = states.map((state) => (state.entry.id === entry.id ? { ...state, last } : state));
      },
      onGauges: (gauges) => options.onGauges(entry.id, gauges),
      onStatus: (status) => setStatus(entry.id, status),
    });
  };

  const load = (entries: readonly SourceEntry[]): void => {
    const known = knownSources(entries, options.connectors);
    const previous = new Map(states.map((state) => [state.entry.id, state]));

    for (const [id, { poller, key }] of running) {
      if (known.some((source) => source.entry.id === id && source.key === key)) continue;

      poller.stop();
      running.delete(id);
    }

    states = known.map((source) => stateAfterLoad(source, previous.get(source.entry.id), running.has(source.entry.id)));
    options.onStates(states);

    for (const { entry, connector, key } of known) {
      if (!running.has(entry.id)) running.set(entry.id, { poller: start(entry, connector), key });
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

/** A Source the app can poll: its entry, its Connector, and the entry as one string, to tell when it changed. */
interface KnownSource {
  readonly entry: SourceEntry;
  readonly connector: Connector;
  readonly key: string;
}

/**
 * Returns the Sources whose Connector the app knows, in the settings' order, each with its Connector.
 * @example
 * knownSources([tramlo, { ...tramlo, id: 'src-2', connector: 'gone' }], [createFeed()]).length; // 1
 */
function knownSources(entries: readonly SourceEntry[], connectors: readonly Connector[]): KnownSource[] {
  return entries.flatMap((entry) => {
    const connector = connectors.find((candidate) => candidate.id === entry.connector);

    return connector === undefined ? [] : [{ entry, connector, key: JSON.stringify(entry) }];
  });
}

/**
 * Returns the state of a Source once the Sources are loaded, from the state it had `before`, if any. Its status is
 * kept while its poller keeps running. Its last Event is kept while its address holds: a new name or interval
 * reads the same Events, so what the Source last sent still holds.
 * @example
 * const renamed = { ...known, entry: { ...tramlo, name: 'Tramlo prod' } };
 * stateAfterLoad(renamed, { entry: tramlo, status: read, last: merged }, false);
 * // { entry: the renamed entry, status: { state: 'waiting' }, last: merged }
 */
function stateAfterLoad(source: KnownSource, before: SourceState | undefined, keepsItsPoller: boolean): SourceState {
  const { entry, connector } = source;
  const status = keepsItsPoller ? before?.status : undefined;
  const sameAddress = before !== undefined && addressOf(before.entry, connector) === addressOf(entry, connector);

  return { entry, status: status ?? { state: 'waiting' }, last: sameAddress ? before.last : null };
}

/**
 * Returns what a Source reads, as one string: its id, its Connector and what it holds for the Connector's fields,
 * those that hold several included, but neither its name nor its interval.
 * @example
 * addressOf(tramlo, feed) === addressOf({ ...tramlo, name: 'Tramlo prod' }, feed); // true
 */
function addressOf(entry: SourceEntry, connector: Connector): string {
  return JSON.stringify([entry.id, entry.connector, readsOf(entry, connector.config.fields)]);
}
