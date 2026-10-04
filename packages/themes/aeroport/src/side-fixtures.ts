import type { Cancel, GaugeValues, WallpaperEvent } from '@deskorama/core';
import type { DayPhase } from './day-phase.ts';

/** What stands on one side of the airport between Gags, and how it follows the hour, the Gauges and the Events. */
export interface SideFixtures {
  readonly setPhase: (phase: DayPhase) => void;
  /** Follows the crowd and the build state. */
  readonly show: (gauges: GaugeValues) => void;
  /** Takes note of an Event as it arrives, before its Gag plays. */
  readonly note: (event: WallpaperEvent) => void;
  /** A new day starts: what counts the day starts again. */
  readonly newDay: () => void;
  readonly dispose: Cancel;
}
