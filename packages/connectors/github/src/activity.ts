/** A contributor, by GitHub account id, who did something at a given time: it feeds the crowd Gauge. */
export interface Activity {
  readonly id: number;
  readonly at: number;
}
