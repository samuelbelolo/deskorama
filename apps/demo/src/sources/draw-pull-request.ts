import type { Random } from '@deskorama/core';
import type { Drawn, Words } from './demo-source.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';

/** Invented pull requests: one number per title, so the same pull request never shows two numbers. */
const PULL_REQUESTS: readonly (Words & { readonly number: number })[] = [
  { number: 412, fr: 'Ajoute l’export PDF des factures', en: 'Add PDF export for invoices' },
  { number: 418, fr: 'Corrige la connexion Google', en: 'Fix Google sign-in' },
  { number: 405, fr: 'Accélère la page Recherche', en: 'Speed up the Search page' },
  { number: 421, fr: 'Mode sombre sur le tableau de bord', en: 'Dark mode on the dashboard' },
  { number: 409, fr: 'Met à jour les dépendances', en: 'Update dependencies' },
  { number: 415, fr: 'Traduit les e-mails en anglais', en: 'Translate e-mails to English' },
];

/**
 * Draws a pull request: its number and title, tagged with a status word, or with its number when `status` is null.
 * Never an author.
 * @example
 * drawPullRequest(random, { fr: 'MERGÉE', en: 'MERGED' }).text.en; // { detail: '#418 Fix Google sign-in', tag: 'MERGED' }
 * drawPullRequest(random, null).text.fr.tag; // "#418"
 */
export function drawPullRequest(random: Random, status: Words | null): Drawn {
  const pull = pick(random, PULL_REQUESTS);
  const number = `#${pull.number}`;

  return drawn([`${number} ${pull.fr}`, status?.fr ?? number], [`${number} ${pull.en}`, status?.en ?? number]);
}
