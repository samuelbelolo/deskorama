/**
 * Returns true in the deep night, when the few lit flats are insomniacs in front of their TV rather than lamps.
 * @example
 * isNightTv(3); // true
 * isNightTv(22); // false
 */
export function isNightTv(hour: number): boolean {
  return hour < 6 || hour >= 23.5;
}
