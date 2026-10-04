import type { Language, Recap } from '@deskorama/core';
import { countPhrase } from './count-phrase.ts';
import type { Strings } from './strings.ts';

/** One hour, in milliseconds. */
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

/**
 * Returns the recap's heading: its title, and how long the wallpaper was hidden with how many Events it missed
 * (the total the suitcases add up to).
 * @example
 * recapHeading(recap, textFor('fr'), 'fr'); // { title: 'Pendant ton absence', note: '2 h, 14 bagages' }
 */
export function recapHeading(recap: Recap, text: Strings, lang: Language): { title: string; note: string } {
  const away = recap.to.getTime() - recap.from.getTime();
  const span =
    away >= HOUR_MS
      ? countPhrase(text.recap.hours, Math.round(away / HOUR_MS), lang)
      : countPhrase(text.recap.minutes, Math.max(1, Math.round(away / MINUTE_MS)), lang);

  return { title: text.recap.title, note: `${span}, ${countPhrase(text.recap.bags, recap.total, lang)}` };
}
