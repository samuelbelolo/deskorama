import type { Language } from '@deskorama/core';
import { shortTime } from '../../shared/short-time.ts';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Returns when something happened, as the window says it next to an Event: a moment ago, some minutes ago, at a
 * time earlier today, yesterday at a time, or on a day. The space before a unit never breaks, so "min" is never
 * left alone on a line.
 * @example
 * agoText(now - 2 * 60_000, now, 'fr'); // 'il y a 2\u00a0min'
 * agoText(yesterdayEvening, now, 'en'); // 'yesterday at 6:40 PM'
 */
export function agoText(at: number, now: number, lang: Language): string {
  const fr = lang === 'fr';
  const elapsed = now - at;

  if (elapsed < MINUTE) return fr ? 'à l’instant' : 'just now';

  if (elapsed < HOUR) {
    const minutes = Math.floor(elapsed / MINUTE);

    return fr ? `il y a ${minutes}\u00a0min` : `${minutes}\u00a0min ago`;
  }

  const time = shortTime(at, lang);
  const days = daysBetween(at, now);

  if (days === 0) return fr ? `à ${time}` : `at ${time}`;

  if (days === 1) return fr ? `hier à ${time}` : `yesterday at ${time}`;

  const day = new Date(at).toLocaleDateString(lang, { day: 'numeric', month: 'short' });

  return fr ? `le ${day}` : `on ${day}`;
}

/**
 * Returns how many midnights of the Mac's own time zone separate two instants.
 * @example
 * daysBetween(Date.parse('2026-10-04T23:50'), Date.parse('2026-10-05T00:10')); // 1
 */
function daysBetween(earlier: number, later: number): number {
  return Math.round((midnightOf(later) - midnightOf(earlier)) / (24 * HOUR));
}

/**
 * Returns the midnight that starts the day of an instant, in the Mac's own time zone.
 * @example
 * midnightOf(Date.parse('2026-10-04T14:23')); // Date.parse('2026-10-04T00:00')
 */
function midnightOf(instant: number): number {
  return new Date(instant).setHours(0, 0, 0, 0);
}
