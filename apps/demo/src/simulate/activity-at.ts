/**
 * Returns how busy a Source is at a fractional hour of the day, from its weight for each hour: interpolated between
 * two hours and scaled so the day averages 1, so a rate "per day" stays true over a whole day.
 * @example
 * activityAt(TRAMLO.hourly, 14.5); // about 1.9: an afternoon at work
 * activityAt(TRAMLO.hourly, 3); // about 0.05: the night
 */
export function activityAt(hourly: readonly number[], hour: number): number {
  const mean = hourly.reduce((sum, weight) => sum + weight, 0) / hourly.length;
  if (mean === 0) return 0;

  const from = Math.floor(hour) % hourly.length;
  const to = (from + 1) % hourly.length;
  const share = hour - Math.floor(hour);

  return ((1 - share) * (hourly[from] ?? 0) + share * (hourly[to] ?? 0)) / mean;
}
