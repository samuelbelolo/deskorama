import type { ThemeAbout } from '@deskorama/core';
import { AEROPORT_ABOUT } from '@deskorama/theme-aeroport/about';
import { IMMEUBLE_ABOUT } from '@deskorama/theme-immeuble/about';
import type { ShippedThemeId } from '../../shared/theme-choice.ts';

/**
 * How each Theme the app ships presents itself, in its own words and pictures: shipping a Theme without adding it
 * here fails to compile.
 */
export const THEME_ABOUTS: Readonly<Record<ShippedThemeId, ThemeAbout>> = {
  aeroport: AEROPORT_ABOUT,
  immeuble: IMMEUBLE_ABOUT,
};
