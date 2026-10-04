/** The fictional Source's Gauges as the simulator keeps them: unrounded, so slow drifts add up between steps. */
export interface GaugeState {
  readonly crowd: number;
  readonly daily: number;
  readonly total: number;
}
