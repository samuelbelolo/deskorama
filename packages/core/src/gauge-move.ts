/** The role of a Gauge: the crowd right now, a count since midnight, or a slow running total. */
export type GaugeRole = 'crowd' | 'daily' | 'total';

/** Every Gauge role. */
export const GAUGE_ROLES: readonly GaugeRole[] = ['crowd', 'daily', 'total'];

/** How an Event moves a Gauge, e.g. commits pushed raise today's commits by 3. */
export interface GaugeMove {
  readonly role: GaugeRole;
  readonly by: number;
}
