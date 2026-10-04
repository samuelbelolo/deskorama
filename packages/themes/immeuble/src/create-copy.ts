import type { GaugeRole, ScreenHost } from '@deskorama/core';
import { fillTemplate } from './fill-template.ts';
import { localeFor } from './locale-for.ts';
import { plainText } from './plain-text.ts';
import type { Forms, Strings } from './strings.ts';
import { textFor } from './text-for.ts';

/** The words of one screen: the building's own, the Source's name and Gauge words, numbers and times, all ready for the font. */
export interface Copy {
  readonly text: Strings;
  /** The Source's name, in capitals. */
  readonly brand: string;
  /** The Source's word for a Gauge, in capitals: the short one for small signs, the label where there is room. */
  gaugeWord(role: GaugeRole, form?: 'short' | 'label'): string;
  /** Fills a template; `{brand}` is always the Source's name. */
  fill(template: string, values?: Readonly<Record<string, string | number>>): string;
  /** Picks the singular or the plural for a count, by the language's rules: 0 is singular in French. */
  plural(n: number, forms: Forms): string;
  /** A whole number in the language's digit groups, in capitals: "9 120" or "9,120". */
  number(n: number): string;
  /** A whole number in a few characters for a small sign, in capitals: "12 K" or "12K". */
  compact(n: number): string;
  /** The time of day of a Clock time, on 24 hours: "14:08". */
  time(at: number): string;
}

/**
 * Returns the words of one screen, in its display language and for its Source.
 * @example
 * const copy = createCopy(host);
 * copy.fill(copy.text.board.title); // "SUR TRAMLO"
 * copy.plural(0, ['JOUR SANS', 'JOURS SANS']); // "JOUR SANS" in French
 */
export function createCopy(host: ScreenHost): Copy {
  const text = textFor(host.lang);
  const locale = localeFor(host.lang);
  const brand = plainText(host.source.name);
  const plurals = new Intl.PluralRules(locale);
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const compacts = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 0 });
  const times = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

  return {
    text,
    brand,
    gaugeWord: (role, form = 'short') => plainText(host.source.gauges[role][form]),
    fill: (template, values = {}) => plainText(fillTemplate(template, { ...values, brand })),
    plural: (n, forms) => (plurals.select(n) === 'one' ? forms[0] : forms[1]),
    number: (n) => plainText(numbers.format(Math.round(n))),
    compact: (n) => plainText(compacts.format(Math.round(n))),
    time: (at) => times.format(new Date(at)),
  };
}
