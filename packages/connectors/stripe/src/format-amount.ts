import type { Language } from '@deskorama/core';

/**
 * Stripe's zero-decimal currencies, whose amounts count whole units. Its three-decimal currencies count thousandths;
 * every other currency counts hundredths in the API, ISK and UGX included although they have no decimals left.
 */
const ZERO_DECIMAL: ReadonlySet<string> = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

/** Stripe's three-decimal currencies, whose amounts count thousandths. */
const THREE_DECIMAL: ReadonlySet<string> = new Set(['bhd', 'jod', 'kwd', 'omr', 'tnd']);

/** The locale that writes amounts in each display language. */
const LOCALES: Readonly<Record<Language, string>> = { fr: 'fr-FR', en: 'en-US' };

/**
 * Returns an amount Stripe counts in the currency's smallest unit, written in the display language: in full for a
 * detail, or rounded and compact for a tag painted on a prop.
 * @example
 * formatAmount(4990, 'eur', 'fr'); // "49,90 €"
 * formatAmount(4900, 'eur', 'en'); // "€49"
 * formatAmount(123_450, 'eur', 'en', 'compact'); // "€1.2K"
 * formatAmount(5000, 'jpy', 'en'); // "¥5,000"
 * formatAmount(5120, 'kwd', 'en'); // "KWD 5.120"
 */
export function formatAmount(
  minor: number,
  currency: string,
  lang: Language,
  style: 'full' | 'compact' = 'full',
): string {
  const units = ZERO_DECIMAL.has(currency) ? minor : minor / (THREE_DECIMAL.has(currency) ? 1000 : 100);

  const format = new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currency: currency.toUpperCase(),
    ...(style === 'compact' ? { notation: 'compact' } : { trailingZeroDisplay: 'stripIfInteger' }),
  });

  return format.format(units);
}
