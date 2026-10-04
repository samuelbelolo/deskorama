/**
 * Returns the hour a time falls in, in UTC, as a key: a recurring error plays at most once in each.
 * @example
 * hourOf(Date.parse('2026-10-04T13:57:40Z')); // '2026-10-04T13'
 */
export function hourOf(time: number): string {
  return new Date(time).toISOString().slice(0, 13);
}
