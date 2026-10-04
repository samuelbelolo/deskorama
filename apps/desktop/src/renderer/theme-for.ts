import type { Theme } from '@deskorama/core';
import { createAeroport } from '@deskorama/theme-aeroport';
import { createImmeuble } from '@deskorama/theme-immeuble';
import type { ShippedThemeId } from '../shared/theme-choice.ts';

/** The Themes this build ships, by id: shipping a Theme without adding it here fails to compile. */
const SHIPPED: Readonly<Record<ShippedThemeId, () => Theme<HTMLElement>>> = {
  aeroport: createAeroport,
  immeuble: createImmeuble,
};

/**
 * Returns a new instance of the Theme `id`.
 * @example
 * themeFor('aeroport').name; // "aeroport"
 * themeFor('immeuble').name; // "immeuble"
 */
export function themeFor(id: ShippedThemeId): Theme<HTMLElement> {
  return SHIPPED[id]();
}
