import {
  ConnectorError,
  type Cancel,
  type Clock,
  type Connector,
  type ConnectorFetch,
  type GaugeValues,
  type SourceEvent,
} from '@deskorama/core';
import { chosenIntervalBounds } from './chosen-interval-bounds.ts';
import type { CursorStore } from './cursor-store.ts';
import { failureOf } from './failure-of.ts';
import { nextPollDelay, type PollOutcome } from './next-poll-delay.ts';
import type { SourceEntry } from './source-entry.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import type { TokenStore } from './token-store.ts';

/** What polls one Source. */
export interface SourcePollerOptions {
  readonly entry: SourceEntry;
  readonly connector: Connector;
  readonly clock: Clock;
  readonly fetch: ConnectorFetch;
  readonly tokens: TokenStore;
  readonly cursors: CursorStore;
  /** Receives the Events of each poll, oldest first, replays included: the caller drops those by id. */
  readonly onEvents: (events: readonly SourceEvent[]) => void;
  readonly onGauges: (gauges: Partial<GaugeValues>) => void;
  readonly onStatus: (status: SourceStatus) => void;
}

/** A Source being polled, until `stop`. */
export interface SourcePoller {
  /**
   * Polls at once, unless a poll is running, the Source is stopped on a refused token or permission, or a rate
   * limit has not reset yet.
   */
  pollNow(): void;
  stop(): void;
}

/**
 * Polls one Source from its persisted cursor, now and then again after the delay {@link nextPollDelay} gives within
 * the interval the person chose, and saves each new cursor. A failure is reported, never thrown: a refused token or a missing permission stops
 * the poller, anything else retries later.
 * @example
 * const poller = createSourcePoller({ entry, connector: createFeed(), clock, fetch, tokens, cursors,
 *   onEvents: (events) => events.forEach(send), onGauges, onStatus: (status) => tray.update(…) });
 * powerMonitor.on('resume', () => poller.pollNow());
 */
export function createSourcePoller(options: SourcePollerOptions): SourcePoller {
  const { entry, connector, clock } = options;

  const bounds = chosenIntervalBounds(connector.config.interval, entry.interval);

  let timer: Cancel | undefined;
  let running = false;
  let stopped = false;
  let halted = false;
  let immediateInARow = 0;
  let failuresInARow = 0;
  // Until when a rate-limited service asked to be left alone: waking the Mac does not poll it sooner.
  let notBefore = 0;

  const schedule = (outcome: PollOutcome): void => {
    const delay = nextPollDelay(outcome, bounds, clock.now());

    if (delay === null) halted = true;
    else if (!stopped) timer = clock.after(delay, () => void poll());
  };

  const poll = async (): Promise<void> => {
    if (running || stopped || halted) return;

    running = true;
    timer?.();

    const outcome = await pollOnce();

    running = false;

    if (!stopped) schedule(outcome);
  };

  const pollOnce = async (): Promise<PollOutcome> => {
    try {
      const token = options.tokens.read(entry.id);

      if (token === null) throw new ConnectorError({ kind: 'auth' }, `${entry.name} has no token in the Keychain.`);

      const settings = { name: entry.name, values: entry.values, token };
      const cursor = options.cursors.read(entry.id);

      const result = await connector.poll({ settings, cursor, fetch: options.fetch, now: clock.now() });

      if (stopped) return { ok: true, immediateInARow };

      // The Events go out before the cursor is saved: if saving fails, the page comes again and its replay is dropped.
      if (result.events.length > 0) options.onEvents(result.events);

      options.cursors.write(entry.id, result.cursor);

      if (result.gauges !== undefined) options.onGauges(result.gauges);

      options.onStatus({ state: 'ok', at: clock.now() });

      failuresInARow = 0;
      immediateInARow = result.delay === 0 ? immediateInARow + 1 : 0;

      return { ok: true, delay: result.delay, immediateInARow };
    } catch (error) {
      const failure = failureOf(error);

      failuresInARow += 1;
      immediateInARow = 0;

      if (failure.kind === 'rate-limit') notBefore = failure.resetAt;

      if (!stopped) options.onStatus({ state: 'failing', failure, at: clock.now() });

      return { ok: false, failure, failuresInARow };
    }
  };

  void poll();

  return {
    pollNow() {
      if (clock.now() >= notBefore) void poll();
    },
    stop() {
      stopped = true;
      timer?.();
    },
  };
}
