import type { Theme } from '@deskorama/core';
import { createAeroport } from '@deskorama/theme-aeroport';
import type { ShippedThemeId } from '../shared/theme-choice.ts';

/** The Themes this build ships, by id: shipping a Theme without adding it here fails to compile. */
const SHIPPED: Readonly<Record<ShippedThemeId, () => Theme<HTMLElement>>> = { aeroport: createAeroport };

/**
 * Returns a new instance of the Theme `id`.
 * @example
 * themeFor('aeroport').name; // "aeroport"
 */
export function themeFor(id: ShippedThemeId): Theme<HTMLElement> {
  return SHIPPED[id]();
}
