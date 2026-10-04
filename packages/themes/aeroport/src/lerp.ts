/**
 * Returns the value `progress` (0 to 1) of the way from `from` to `to`.
 * @example
 * lerp(100, 200, 0.25); // 125
 */
export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}
