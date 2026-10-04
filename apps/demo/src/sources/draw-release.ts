import type { Random } from '@deskorama/core';
import { between } from './between.ts';
import type { Drawn, Words } from './demo-source.ts';
import { drawn } from './drawn.ts';
import { pick } from './pick.ts';

/** What an invented release brings, in both languages. */
const HEADLINES: readonly Words[] = [
  { fr: 'export PDF et mode sombre', en: 'PDF export and dark mode' },
  { fr: 'recherche plus rapide', en: 'faster search' },
  { fr: 'nouvel accueil', en: 'new onboarding' },
];

/**
 * Draws a release: its version and headline, the version painted as the tag.
 * @example
 * drawRelease(random).text.en; // { detail: 'v2.5.0: PDF export and dark mode', tag: 'v2.5.0' }
 */
export function drawRelease(random: Random): Drawn {
  const version = `v2.${between(random, 4, 9)}.0`;
  const headline = pick(random, HEADLINES);

  return drawn([`${version} : ${headline.fr}`, version], [`${version}: ${headline.en}`, version]);
}
