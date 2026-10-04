import type { Language } from '@deskorama/core';
import type { StripePaymentIntent } from './payment-intent-schema.ts';

/** The reasons worth naming, by Stripe's error or decline code; any other reads as a refusal by the bank. */
const REASONS: Readonly<Record<string, Readonly<Record<Language, string>>>> = {
  insufficient_funds: { fr: 'Provision insuffisante', en: 'Insufficient funds' },
  expired_card: { fr: 'Carte expirée', en: 'Card expired' },
  incorrect_cvc: { fr: 'Code de sécurité erroné', en: 'Wrong security code' },
  invalid_cvc: { fr: 'Code de sécurité erroné', en: 'Wrong security code' },
  lost_card: { fr: 'Carte déclarée perdue', en: 'Card reported lost' },
  stolen_card: { fr: 'Carte déclarée volée', en: 'Card reported stolen' },
  authentication_required: { fr: 'Authentification requise', en: 'Authentication required' },
  payment_intent_authentication_failure: { fr: 'Authentification échouée', en: 'Authentication failed' },
  processing_error: { fr: 'Erreur de traitement', en: 'Processing error' },
};

/** What a refusal without a known reason says. */
const DECLINED_BY_BANK: Readonly<Record<Language, string>> = {
  fr: 'Refusé par la banque',
  en: 'Declined by the bank',
};

/**
 * Returns why a payment failed, in words of the display language: the bank's decline code when it gave one, else
 * Stripe's error code, and a plain refusal for any code without words of its own.
 * @example
 * declineReason({ amount: 4900, currency: 'eur', last_payment_error: { code: 'card_declined',
 *   decline_code: 'insufficient_funds' } }, 'fr'); // "Provision insuffisante"
 * declineReason({ amount: 4900, currency: 'eur' }, 'en'); // "Declined by the bank"
 */
export function declineReason(intent: StripePaymentIntent, lang: Language): string {
  const error = intent.last_payment_error;

  const code = error?.decline_code ?? error?.code ?? null;

  // A code is external text: only the table's own keys count, never an inherited one such as "constructor".
  const words = code !== null && Object.hasOwn(REASONS, code) ? REASONS[code] : undefined;

  return (words ?? DECLINED_BY_BANK)[lang];
}
