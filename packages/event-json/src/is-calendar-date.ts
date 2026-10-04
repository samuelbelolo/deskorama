/** How many days each month has, January first, in a year that is not a leap year. */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Returns true when a timestamp whose shape was already checked names a day its month has: 29 February only in a leap
 * year, never 31 April.
 * @example
 * isCalendarDate('2028-02-29T10:00:00Z'); // true
 * isCalendarDate('2026-02-31T10:00:00Z'); // false
 */
export function isCalendarDate(timestamp: string): boolean {
  const year = Number(timestamp.slice(0, 4));
  const month = Number(timestamp.slice(5, 7));
  const day = Number(timestamp.slice(8, 10));

  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const last = month === 2 && leap ? 29 : (MONTH_DAYS[month - 1] ?? 0);

  return day <= last;
}
