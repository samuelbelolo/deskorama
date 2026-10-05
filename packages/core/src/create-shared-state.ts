import { buildStateAfter } from './build-state-after.ts';
import type { Cancel, Clock } from './clock.ts';
import { createDayKey } from './create-day-key.ts';
import { createDedupe } from './create-dedupe.ts';
import { createGauges } from './create-gauges.ts';
import { createListeners } from './create-listeners.ts';
import { createTally, RECENT_SIZE } from './create-tally.ts';
import type { GaugeValues } from './gauge-values.ts';
import type { SharedSnapshot } from './shared-snapshot.ts';
import { stepOf } from './step-of.ts';
import type { Today } from './today.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** How many Events the engine remembers to recognise a replay. */
const DEDUPE_CAPACITY = 5000;

/** What the engine keeps once for every screen: the Gauges, today's tally and the Events already seen. */
export interface SharedState {
  /** Takes an Event into account; false when it is a replay, which must not play again. */
  readonly accept: (event: WallpaperEvent) => boolean;
  readonly gauges: () => GaugeValues;
  readonly onGauges: (listener: (values: GaugeValues) => void) => Cancel;
  readonly setGauges: (values: Partial<GaugeValues>) => void;
  readonly today: () => Today;
  readonly recent: (count?: number) => readonly WallpaperEvent[];
  /** Everything above at this instant, as plain values. */
  readonly snapshot: () => SharedSnapshot;
  /** Takes over the values another shared state kept, when it read them. */
  readonly restore: (snapshot: SharedSnapshot) => void;
  /** Calls `listener` once whenever a Gauge, today's tally or the recent Events changed, until cancelled. */
  readonly onChange: (listener: () => void) => Cancel;
}

/**
 * Returns the shared state of an engine. At the first input or read after midnight (in `timeZone`), today's counts
 * and the daily Gauge start again from zero; an Event that happened before today is kept among the recent ones but
 * counts neither today nor in the daily Gauge.
 * @example
 * const shared = createSharedState(clock, 'Europe/Paris');
 * shared.accept(pushedCommits); // true: counted, and the daily Gauge rises by its move
 * shared.accept(pushedCommits); // false: a replay
 */
export function createSharedState(clock: Clock, timeZone: string | undefined): SharedState {
  const dayOf = createDayKey(timeZone);
  const gauges = createGauges();
  const tally = createTally(dayOf(clock.now()));
  const dedupe = createDedupe(DEDUPE_CAPACITY);
  const changes = createListeners<void>();

  // Several values can move in one step (an Event counts and moves a Gauge): the listeners hear of it once.
  let changed = false;

  gauges.onChange(() => {
    changed = true;
  });

  const rollover = (): string => {
    const day = dayOf(clock.now());

    if (tally.startDay(day)) {
      gauges.set({ daily: 0 });
      changed = true;
    }

    return day;
  };

  /** Tells the listeners of what changed since they last heard, if anything did. */
  const settle = (): void => {
    if (!changed) return;

    changed = false;
    changes.emit();
  };

  return {
    accept(event) {
      if (!dedupe.firstTime(event.source, event.id)) return false;

      const happenedToday = dayOf(event.at.getTime()) === rollover();
      tally.record(event, happenedToday);

      if (event.gauge !== undefined && (happenedToday || event.gauge.role !== 'daily')) gauges.move(event.gauge);

      const step = stepOf(event);
      if (step !== undefined) gauges.set({ build: buildStateAfter(step) });

      changed = true;
      settle();

      return true;
    },
    gauges() {
      rollover();
      settle();

      return gauges.values();
    },
    onGauges: gauges.onChange,
    setGauges(values) {
      rollover();
      gauges.set(values);
      settle();
    },
    today() {
      rollover();
      settle();

      return tally.today();
    },
    recent: tally.recent,
    snapshot() {
      rollover();
      settle();

      return { at: clock.now(), gauges: gauges.values(), today: tally.today(), recent: tally.recent(RECENT_SIZE) };
    },
    restore(snapshot) {
      tally.restore(dayOf(snapshot.at), snapshot.today, snapshot.recent);
      gauges.set(snapshot.gauges);
      rollover();
      settle();
    },
    onChange: changes.add,
  };
}
