/** One stop of a keyframe track: at this time (ms or progress), this value. */
export type Stop = readonly [at: number, value: number];

/**
 * Returns the value of a track of stops at time `at`, straight lines between stops, held flat before the first
 * and after the last. Stops must be in time order.
 * @example
 * keyframe(500, [[0, 0], [1000, 1]]); // 0.5
 * keyframe(4000, [[0, 0], [300, 1], [3200, 1], [3600, 0]]); // 0
 */
export function keyframe(at: number, stops: readonly Stop[]): number {
  const first = stops[0];
  if (first === undefined) return 0;
  if (at <= first[0]) return first[1];

  for (let i = 1; i < stops.length; i += 1) {
    const [toAt, toValue] = stops[i] ?? first;
    const [fromAt, fromValue] = stops[i - 1] ?? first;
    if (at <= toAt) return fromValue + ((toValue - fromValue) * (at - fromAt)) / (toAt - fromAt || 1);
  }

  return (stops.at(-1) ?? first)[1];
}
