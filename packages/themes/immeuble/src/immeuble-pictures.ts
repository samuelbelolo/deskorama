import type { ThemePictures } from '@deskorama/core';

/**
 * Pictures of L'Immeuble as it really draws. Each address is resolved from this module, so a bundler ships the
 * file beside the code and rewrites the address to where it lands.
 */
export const IMMEUBLE_PICTURES: ThemePictures = {
  day: new URL('../pictures/day.webp', import.meta.url).href,
  night: new URL('../pictures/night.webp', import.meta.url).href,
  jackpot: new URL('../pictures/jackpot.webp', import.meta.url).href,
};
