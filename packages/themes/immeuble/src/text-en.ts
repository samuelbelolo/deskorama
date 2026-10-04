import type { Strings } from './strings.ts';

/** L'Immeuble in English: native lines, not translations. */
export const EN: Strings = {
  sounds: {
    arrival: 'KNOCK KNOCK!',
    partner: 'TA-DA!',
    departure: null,
    approval: 'THUD!',
    rejection: 'NAH!',
    abandon: 'TOSS!',
    like: null,
    celebration: 'WOW!',
    message: null,
    publish: null,
    usage: null,
    money: 'KA-CHING!',
    error: 'BEEP!',
    blocked: 'HALT!',
    deploy: null,
    other: null,
  },
  errors: ['BEEP!', 'BZZT!', 'OUCH!'],
  props: { via: 'VIA', stop: 'STOP', ok: 'OK', plusOne: '+1' },
  board: { title: 'ON {brand}' },
  site: {
    days: ['DAY SINCE', 'DAYS SINCE'],
    what: 'LAST CRASH',
    idle: 'IN PROD',
    building: 'DEPLOYING',
    live: 'LIVE AT {time}',
  },
  hall: ['KEPT', 'OUT'],
  arcade: { title: 'GAME OVER', ask: 'CONTINUE? {n}', end: 'THANKS FOR PLAYING', coin: 'INSERT COIN' },
  description:
    'A Paris apartment building cut open: the lit flats, the concierge’s lodge, the crane on the roof and the street. Every event plays a small scene there with its caption.',
};
