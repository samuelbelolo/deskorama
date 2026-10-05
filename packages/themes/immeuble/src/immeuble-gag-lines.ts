import type { ThemeAbout } from '@deskorama/core';

/** What L'Immeuble plays for each Role and for the failed deploy: one short sentence in each display language. */
export const IMMEUBLE_GAG_LINES: ThemeAbout['gags'] = {
  arrival: {
    fr: 'Un voisin et sa valise, ou une nouvelle étiquette aux boîtes aux lettres.',
    en: 'A newcomer with a suitcase, or a new label on the letterboxes.',
  },
  partner: {
    fr: 'Tapis rouge, un invité en haut-de-forme.',
    en: 'Red carpet, a top-hat guest walks on.',
  },
  departure: {
    fr: 'Une gomme géante efface un locataire.',
    en: 'A giant eraser rubs a tenant out.',
  },
  approval: {
    fr: 'Un tampon géant, l’immeuble sursaute.',
    en: 'A giant stamp, the building jolts.',
  },
  rejection: {
    fr: 'Un pouce vers le bas et la carte tombe, ou deux traits d’encre la barrent.',
    en: 'A thumb down and the card falls, or two ink strokes cross it out.',
  },
  abandon: {
    fr: 'Un dossier part au recyclage.',
    en: 'A folder drops into the recycling.',
  },
  like: {
    fr: 'Un grand pouce se lève, les voisins applaudissent.',
    en: 'A big thumb goes up, the tenants cheer.',
  },
  celebration: {
    fr: 'Feu d’artifice et trophée, tout s’allume.',
    en: 'Fireworks and a trophy, every flat lights up.',
  },
  message: {
    fr: 'Un voisin au téléphone, une bulle s’ouvre.',
    en: 'A tenant on the phone, a speech bubble.',
  },
  publish: {
    fr: 'Une banderole vermillon sur un appartement.',
    en: 'A vermilion banner over a flat.',
  },
  usage: {
    fr: 'L’imprimante sort une page, ou une calculatrice fait le compte.',
    en: 'The printer pushes out a page, or a desk calculator adds it up.',
  },
  money: {
    fr: 'La caisse fait KA\u2011CHING, ou des pièces tombent dans la tirelire.',
    en: 'The cash register goes KA\u2011CHING, or coins drop into the piggy bank.',
  },
  error: {
    fr: 'Un écran vire au rouge, avec un grand «\u00a0!\u00a0».',
    en: 'A screen turns red with a big “!”.',
  },
  blocked: {
    fr: 'Un robot bute contre notre barrière.',
    en: 'A robot bumps into our barrier.',
  },
  deploy: {
    fr: 'La grue construit et livre.',
    en: 'The crane builds and delivers.',
  },
  'failed-deploy': {
    fr: 'Le chantier s’effondre, tout s’éteint, FIN DE PARTIE.',
    en: 'The site collapses, blackout, GAME OVER.',
  },
};
