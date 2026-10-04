import type { Language } from '@deskorama/core';
import { localeFor } from './locale-for.ts';

/**
 * Returns a count written to fit `cells` split-flap cells: in full when it fits, else in compact notation with one
 * decimal, else with none, so a large Gauge reads as "124K" rather than losing its last digits.
 * @example
 * fitNumber(37, 6, 'en'); // "37"
 * fitNumber(123_456, 6, 'en'); // "123.5K"
 * fitNumber(1_234_567, 4, 'fr'); // "1 M"
 */
export function fitNumber(count: number, cells: number, lang: Language): string {
  const locale = localeFor(lang);
  const forms = [
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }),
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 0 }),
  ];

  const written = forms.map((form) => form.format(count));

  return written.find((each) => each.length <= cells) ?? written.at(-1) ?? String(count);
}
