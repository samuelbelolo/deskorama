import type { ConnectorFailure, Language } from '@deskorama/core';
import { shortTime } from './short-time.ts';

/**
 * Returns what a failing Source needs from the person, in the display language: a new token, the permission it
 * lacks, or patience until a rate limit resets.
 * @example
 * failureText({ kind: 'permission', permission: 'Actions: read' }, 'en');
 * // 'The token lacks the “Actions:\u00a0read” permission.'
 * failureText({ kind: 'auth' }, 'fr'); // 'Jeton refusé\u00a0: collez-en un nouveau.'
 */
export function failureText(failure: ConnectorFailure, lang: Language): string {
  const fr = lang === 'fr';

  if (failure.kind === 'auth') {
    return fr ? 'Jeton refusé\u00a0: collez-en un nouveau.' : 'Token refused: paste a new one.';
  }

  if (failure.kind === 'permission') {
    return fr
      ? `Il manque la permission «\u00a0${unbroken(failure.permission)}\u00a0» au jeton.`
      : `The token lacks the “${unbroken(failure.permission)}” permission.`;
  }

  if (failure.kind === 'rate-limit') {
    const time = shortTime(failure.resetAt, lang);

    return fr ? `Limite atteinte, reprise à ${time}.` : `Rate limited, resuming at ${time}.`;
  }

  if (failure.kind === 'network') return fr ? 'Injoignable, nouvel essai bientôt.' : 'Unreachable, trying again soon.';

  return fr ? 'Réponse inattendue\u00a0: vérifiez l’adresse.' : 'Unexpected answer: check the address.';
}

/**
 * Returns a permission's name with its spaces made non-breaking, so a line never ends in the middle of it.
 * @example
 * unbroken('Subscriptions: Read'); // 'Subscriptions:\u00a0Read'
 */
function unbroken(name: string): string {
  return name.replaceAll(' ', '\u00a0');
}
