import { buildStateAfter } from './build-state-after.ts';
import type { Cancel, Clock } from './clock.ts';
import { createDayKey } from './create-day-key.ts';
import { createDedupe } from './create-dedupe.ts';
import { createGauges } from './create-gauges.ts';
import { createTally } from './create-tally.ts';
import type { GaugeValues } from './gauge-values.ts';
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
  const rollover = (): string => {
    const day = dayOf(clock.now());

    if (tally.startDay(day)) gauges.set({ daily: 0 });

    return day;
  };

  return {
    accept(event) {
      if (!dedupe.firstTime(event.source, event.id)) return false;

      const happenedToday = dayOf(event.at.getTime()) === rollover();
      tally.record(event, happenedToday);

      if (event.gauge !== undefined && (happenedToday || event.gauge.role !== 'daily')) gauges.move(event.gauge);

      const step = stepOf(event);
      if (step !== undefined) gauges.set({ build: buildStateAfter(step) });

      return true;
    },
    gauges() {
      rollover();
      return gauges.values();
    },
    onGauges: gauges.onChange,
    setGauges(values) {
      rollover();
      gauges.set(values);
    },
    today() {
      rollover();
      return tally.today();
    },
    recent: tally.recent,
  };
}
