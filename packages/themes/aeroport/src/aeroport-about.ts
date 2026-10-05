import type { ThemeAbout } from '@deskorama/core';
import { AEROPORT_GAG_LINES } from './aeroport-gag-lines.ts';
import { AEROPORT_PICTURES } from './aeroport-pictures.ts';

/** How L'Aéroport presents itself where a person picks a Theme and tries its Gags. */
export const AEROPORT_ABOUT: ThemeAbout = {
  name: 'L’Aéroport',
  pitch: {
    fr: 'Un aéroport d’affiche des années 1960, cobalt et orange international.',
    en: 'A 1960s airline-poster airport, cobalt and international orange.',
  },
  gags: AEROPORT_GAG_LINES,
  pictures: AEROPORT_PICTURES,
};
