/**
 * Returns how many figures show a crowd in a fixed number of places: one per person while the Source's busiest
 * crowd fits, else scaled so that busiest crowd just fills the places.
 * @example
 * crowdFit(9, 14, 30); // 9, a small team: one figure each
 * crowdFit(18, 36, 30); // 15
 * crowdFit(50, 36, 30); // 30, never more than the places
 */
export function crowdFit(crowd: number, max: number, places: number): number {
  const scaled = max > places ? (crowd * places) / max : crowd;

  return Math.max(0, Math.min(places, Math.round(scaled)));
}
