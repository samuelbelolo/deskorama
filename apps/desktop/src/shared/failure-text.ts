import type { ConnectorFailure, Language } from '@deskorama/core';
import { shortTime } from './short-time.ts';

/**
 * Returns what a failing Source needs from the person, in the display language: a new token, the permission it
 * lacks, or patience until a rate limit resets.
 * @example
 * failureText({ kind: 'permission', permission: 'Actions: read' }, 'en');
 * // 'The token lacks the “Actions: read” permission.'
 * failureText({ kind: 'auth' }, 'fr'); // 'Jeton refusé : collez-en un nouveau.'
 */
export function failureText(failure: ConnectorFailure, lang: Language): string {
  const fr = lang === 'fr';

  if (failure.kind === 'auth') return fr ? 'Jeton refusé : collez-en un nouveau.' : 'Token refused: paste a new one.';

  if (failure.kind === 'permission') {
    return fr
      ? `Il manque la permission « ${failure.permission} » au jeton.`
      : `The token lacks the “${failure.permission}” permission.`;
  }

  if (failure.kind === 'rate-limit') {
    const time = shortTime(failure.resetAt, lang);

    return fr ? `Limite atteinte, reprise à ${time}.` : `Rate limited, resuming at ${time}.`;
  }

  if (failure.kind === 'network') return fr ? 'Injoignable, nouvel essai bientôt.' : 'Unreachable, trying again soon.';

  return fr ? 'Réponse inattendue : vérifiez l’adresse.' : 'Unexpected answer: check the address.';
}
