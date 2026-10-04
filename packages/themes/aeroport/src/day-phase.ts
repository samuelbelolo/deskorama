/** The part of the day that switches lights and people: the lit hall, the sleeping controller, the moon. */
export type DayPhase = 'night' | 'dawn' | 'day' | 'dusk';

/**
 * Returns the phase of the day at a fractional hour.
 * @example
 * dayPhase(3); // "night"
 * dayPhase(14); // "day"
 * dayPhase(20); // "dusk"
 */
export function dayPhase(hour: number): DayPhase {
  if (hour < 6 || hour >= 22) return 'night';
  if (hour < 7.5) return 'dawn';
  if (hour < 19) return 'day';

  return 'dusk';
}
