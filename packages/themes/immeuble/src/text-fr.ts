import type { Strings } from './strings.ts';

/** L'Immeuble in French. */
export const FR: Strings = {
  sounds: {
    arrival: 'TOC TOC !',
    partner: 'TADAM !',
    departure: null,
    approval: 'PAF !',
    rejection: 'BOF !',
    abandon: 'HOP !',
    like: null,
    celebration: 'WAOUH !',
    message: null,
    publish: null,
    usage: null,
    money: 'KA-CHING !',
    error: 'BIP !',
    blocked: 'HALTE !',
    deploy: null,
    other: null,
  },
  errors: ['BIP !', 'BZZT !', 'AÏE !'],
  props: { via: 'VIA', stop: 'STOP', ok: 'VU', plusOne: '+1' },
  board: { title: 'SUR {brand}' },
  site: {
    days: ['JOUR SANS', 'JOURS SANS'],
    what: 'ACCIDENT',
    idle: 'DE MISE EN LIGNE',
    building: 'MISE EN LIGNE',
    live: 'EN LIGNE À {time}',
  },
  hall: ['INTRUS', 'BLOQUÉS'],
  arcade: { title: 'FIN DE PARTIE', ask: 'CONTINUER ? {n}', end: 'À LA PROCHAINE', coin: 'INSÉREZ UNE PIÈCE' },
  description:
    'Un immeuble parisien en coupe : les appartements allumés, la loge, la grue sur le toit et la rue. Chaque événement y joue une petite scène avec sa légende.',
};
