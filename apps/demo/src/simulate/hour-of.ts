/**
 * Returns the hour of the day at a Clock time, as a fraction, in the visitor's local time: the scene's sky and the
 * fictional Sources' rhythm follow the same hour.
 * @example
 * hourOf(new Date(2026, 9, 4, 14, 30).getTime()); // 14.5
 */
export function hourOf(time: number): number {
  const date = new Date(time);

  return date.getHours() + date.getMinutes() / 60;
}
