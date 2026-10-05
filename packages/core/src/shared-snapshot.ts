import type { GaugeValues } from './gauge-values.ts';
import type { Today } from './today.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * What every screen shares, as the engine keeps it at one instant: the Gauges, today's tally and the recent Events.
 * A platform that draws each screen in a page of its own carries it from the engine to the player of every page.
 */
export interface SharedSnapshot {
  /** When it was read, in milliseconds since the epoch: `today` counts the day of that instant. */
  readonly at: number;
  readonly gauges: GaugeValues;
  readonly today: Today;
  /** Every recent Event the engine keeps, newest first. */
  readonly recent: readonly WallpaperEvent[];
}
