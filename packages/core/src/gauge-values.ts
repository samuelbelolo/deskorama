/** Where production stands: nothing running, a deploy building, the last deploy shipped, or it failed. */
export type BuildState = 'idle' | 'building' | 'ready' | 'error';

/** The value of every Gauge, identical on every screen. */
export interface GaugeValues {
  /** How many right now: people on the site, contributors active this hour. */
  readonly crowd: number;
  /** Counted since midnight. */
  readonly daily: number;
  /** A slow running total. */
  readonly total: number;
  readonly build: BuildState;
}
