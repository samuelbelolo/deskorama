import type { ThemeAbout } from '@deskorama/core';
import { IMMEUBLE_GAG_LINES } from './immeuble-gag-lines.ts';
import { IMMEUBLE_PICTURES } from './immeuble-pictures.ts';

/** How L'Immeuble presents itself where a person picks a Theme and tries its Gags. */
export const IMMEUBLE_ABOUT: ThemeAbout = {
  name: 'L’Immeuble',
  pitch: {
    fr: 'Un immeuble parisien en pixel art, vu en coupe, ses locataires et la grue sur le toit.',
    en: 'A pixel-art Paris building cut open, its tenants and the crane on the roof.',
  },
  gags: IMMEUBLE_GAG_LINES,
  pictures: IMMEUBLE_PICTURES,
};
