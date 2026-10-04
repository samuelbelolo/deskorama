import type { Words } from './demo-source.ts';

/** The CI jobs of Tramlo, the invented private repository. */
export const JOBS: readonly Words[] = [
  { fr: 'tests', en: 'tests' },
  { fr: 'lint', en: 'lint' },
  { fr: 'build', en: 'build' },
  { fr: 'tests de bout en bout', en: 'end-to-end tests' },
];

/** Its branches. */
export const BRANCHES: readonly string[] = [
  'feature/export-pdf',
  'fix/google-sign-in',
  'feature/dark-mode',
  'chore/deps',
  'feature/search-speed',
];

/** Secrets its push protection stops: where they were, never their value. */
export const SECRETS: readonly Words[] = [
  { fr: 'Clé d’API dans config/prod.env', en: 'API key in config/prod.env' },
  { fr: 'Jeton de paiement dans un test', en: 'Payment token in a test' },
  { fr: 'Mot de passe de base dans le README', en: 'Database password in the README' },
];

/** Its teams. */
export const TEAMS: readonly Words[] = [
  { fr: 'backend', en: 'backend' },
  { fr: 'front', en: 'front-end' },
  { fr: 'mobile', en: 'mobile' },
  { fr: 'data', en: 'data' },
];
