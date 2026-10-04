/**
 * Every Theme the menu bar and the settings window offer, in that order, each named by a proper noun kept the same in
 * every language; one the app does not ship yet is shown greyed out. Shipping one is setting `available` and adding
 * it to `themeFor`.
 */
export const THEME_CHOICES = [
  { id: 'aeroport', name: 'L’Aéroport', available: true },
  { id: 'immeuble', name: 'L’Immeuble', available: false },
] as const;

/** A Theme the app ships, the only kind a person may pick and a page may draw. */
export type ShippedThemeId = Extract<(typeof THEME_CHOICES)[number], { readonly available: true }>['id'];

/** The Themes the app ships, in the order they are offered. */
export const AVAILABLE_THEMES: readonly ShippedThemeId[] = THEME_CHOICES.flatMap((choice) =>
  choice.available ? [choice.id] : [],
);

/** The Theme a new install starts with, and the one a setting naming an unknown Theme falls back to. */
export const DEFAULT_THEME: ShippedThemeId = 'aeroport';
