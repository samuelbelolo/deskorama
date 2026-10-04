/** The three lights the building is drawn under, stepped like a 16-bit game. */
export type LightMode = 'day' | 'twilight' | 'night';

/**
 * Returns the light of a fractional hour: night before 6:00 and after 21:30, twilight around dawn and dusk.
 * @example
 * lightMode(14); // "day"
 * lightMode(6.5); // "twilight"
 * lightMode(3); // "night"
 */
export function lightMode(hour: number): LightMode {
  if (hour < 6 || hour >= 21.5) return 'night';
  if (hour < 7.5 || hour >= 19.5) return 'twilight';

  return 'day';
}
