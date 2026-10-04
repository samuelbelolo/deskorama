import type { Theme } from '@deskorama/core';
import { createAeroport } from '@deskorama/theme-aeroport';
import { createImmeuble } from '@deskorama/theme-immeuble';
import type { Words } from './sources/demo-source.ts';

/** One Theme of the Theme picker. */
export interface DemoTheme {
  readonly id: string;
  readonly name: Words;
  /** Makes the Theme; null while it is not ready, so the picker shows it disabled. */
  readonly create: (() => Theme<HTMLElement>) | null;
}

/** The Themes the visitor picks from. */
export const DEMO_THEMES: readonly [DemoTheme, ...DemoTheme[]] = [
  { id: 'aeroport', name: { fr: 'L’Aéroport', en: 'L’Aéroport' }, create: createAeroport },
  { id: 'immeuble', name: { fr: 'L’Immeuble', en: 'L’Immeuble' }, create: createImmeuble },
];
