import type { Language } from '@deskorama/core';
import { formatAmount } from './format-amount.ts';

/**
 * Returns the tag painted on a prop for money coming in: the amount, rounded and compact, after a plus sign.
 * @example
 * amountTag(4900, 'eur', 'fr'); // "+49 €"
 * amountTag(123_450, 'eur', 'en'); // "+€1.2K"
 */
export function amountTag(minor: number, currency: string, lang: Language): string {
  return `+${formatAmount(minor, currency, lang, 'compact')}`;
}
