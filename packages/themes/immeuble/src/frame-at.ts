/**
 * Returns the whole frame index of stepped animation at `t` ms, wrapping after `count` frames when given.
 * @example
 * frameAt(450, 150); // 3
 * frameAt(450, 150, 2); // 1
 */
export function frameAt(t: number, ms: number, count: number = Number.POSITIVE_INFINITY): number {
  const index = Math.floor(Math.max(0, t) / ms);

  return Number.isFinite(count) ? index % count : index;
}
