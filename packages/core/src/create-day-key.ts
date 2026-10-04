/**
 * Returns a function that names the calendar day of an instant in a time zone, as "YYYY-MM-DD". "Since midnight"
 * depends on where the person is, so the zone is an engine option rather than the machine's setting.
 * @example
 * const dayOf = createDayKey('Europe/Paris');
 * dayOf(Date.UTC(2026, 9, 4, 22, 30)); // "2026-10-05", already past midnight in Paris
 * createDayKey('UTC')(Date.UTC(2026, 9, 4, 22, 30)); // "2026-10-04"
 */
export function createDayKey(timeZone: string | undefined): (ms: number) => string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const format = new Intl.DateTimeFormat('en-US', timeZone === undefined ? options : { ...options, timeZone });
  return (ms) => {
    const parts = format.formatToParts(ms);
    const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((each) => each.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
}
