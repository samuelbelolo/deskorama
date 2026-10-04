import type { Words } from './demo-source.ts';

/** Where a new star of Tramlo Kit, the invented open-source library, comes from. */
export const REFERRERS: readonly Words[] = [
  { fr: 'Via une newsletter', en: 'From a newsletter' },
  { fr: 'Via la page Explore', en: 'From the Explore page' },
  { fr: 'Via un fil de forum', en: 'From a forum thread' },
  { fr: 'Via un article de blog', en: 'From a blog post' },
];

/** What a newcomer's first pull request does. */
export const FIRST_CONTRIBUTIONS: readonly Words[] = [
  { fr: 'corrige une faute dans le README', en: 'fix a typo in the README' },
  { fr: 'ajoute un test', en: 'add a test' },
  { fr: 'traduit la doc', en: 'translate the docs' },
];

/** Monthly sponsorship amounts, in dollars; the small ones come more often. */
export const SPONSOR_AMOUNTS: readonly number[] = [5, 5, 10, 25];
