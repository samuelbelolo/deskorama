/**
 * Returns the hour of the day at a Clock time, as a fraction, in the local time of the machine showing the
 * wallpaper: the sky follows the person's day, not UTC.
 * @example
 * localHour(new Date(2026, 9, 4, 14, 30).getTime()); // 14.5
 */
export function localHour(time: number): number {
  const date = new Date(time);

  return date.getHours() + date.getMinutes() / 60;
}
