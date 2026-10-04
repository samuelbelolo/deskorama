import type { Cancel, Clock } from './clock.ts';
import type { GaugeValues } from './gauge-values.ts';
import type { Language } from './language.ts';
import type { Random } from './random.ts';
import type { Recap } from './recap.ts';
import type { Screen } from './screen.ts';
import type { SourceInfo } from './source-info.ts';
import type { Today } from './today.ts';
import type { VisibleRegions } from './visible-regions.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/**
 * The host API a Theme receives for one screen: everything it may read or subscribe to. Gauges, today's tally and
 * the recent Events are identical on every screen; the visible regions are this screen's own, in its own pixels.
 */
export interface ScreenHost extends VisibleRegions {
  /** The display language: every string the Theme draws exists in each language. */
  readonly lang: Language;
  /** The screen this Theme instance draws on. */
  readonly screen: Screen;
  /** Every connected screen, left to right, so a Theme can hand an animation over to its neighbour. */
  readonly screens: () => readonly Screen[];
  /** Calls `listener` with every connected screen whenever the arrangement changes, until cancelled. */
  readonly onScreens: (listener: (screens: readonly Screen[]) => void) => Cancel;
  /** Display frames stop while the screen is hidden; timers keep running. */
  readonly clock: Clock;
  /** Seeded, so a Gag is a function of the Event, the time and the seed. */
  readonly random: Random;
  /** When true, Gags hold a still key pose instead of moving. */
  readonly reducedMotion: boolean;
  /** The Source that names the scene, with the words of its Gauges in the display language. */
  readonly source: SourceInfo;
  /**
   * Calls `listener` with every Event routed to this screen until cancelled: one screen per Event, drawn in
   * proportion to visible wallpaper area, while deploys reach every screen.
   */
  onEvent(listener: (event: WallpaperEvent) => void): Cancel;
  readonly gauges: () => GaugeValues;
  /** Calls `listener` with the new values whenever a Gauge changes, until cancelled. */
  readonly onGauges: (listener: (gauges: GaugeValues) => void) => Cancel;
  /** What happened since midnight, and the last deploy. */
  readonly today: () => Today;
  /** The latest Events, newest first: 12 unless `count` says otherwise, at most 40. */
  readonly recent: (count?: number) => readonly WallpaperEvent[];
  /** Calls `listener` with the visible fraction whenever the window frames change, until cancelled. */
  readonly onVisibility: (listener: (fraction: number) => void) => Cancel;
  /**
   * Calls `listener` with the recap of what was missed whenever the wallpaper shows again after a while hidden and
   * this screen has the most visible wallpaper, until cancelled. A missed failed deploy follows through `onEvent`.
   */
  readonly onRecap: (listener: (recap: Recap) => void) => Cancel;
}
