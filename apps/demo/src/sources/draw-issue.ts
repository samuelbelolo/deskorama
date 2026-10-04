import type { GaugeMove, Random } from '@deskorama/core';
import { between } from './between.ts';
import type { Drawn, Words } from './demo-source.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';

/** Invented issue titles, in both languages. */
const ISSUES: readonly Words[] = [
  { fr: 'Le bouton Exporter ne répond plus', en: 'The Export button does nothing' },
  { fr: 'Le mot de passe oublié ne marche pas', en: 'Forgot password is broken' },
  { fr: 'L’appli est lente le lundi matin', en: 'The app is slow on Monday mornings' },
  { fr: 'Faute de frappe sur la page Tarifs', en: 'Typo on the Pricing page' },
];

/**
 * Draws an opened issue: its number and title, never its author, with the Gauge move it brings when there is one.
 * @example
 * drawIssue(random, { role: 'total', by: 1 }).text.fr; // { detail: '« Le bouton Exporter ne répond plus »', tag: '#421' }
 */
export function drawIssue(random: Random, gauge?: GaugeMove): Drawn {
  const number = `#${between(random, 400, 440)}`;
  const issue = pick(random, ISSUES);

  return drawn([`« ${issue.fr} »`, number], [`“${issue.en}”`, number], gauge);
}
