import { LANGUAGES, type GaugeRole, type Language } from '@deskorama/core';
import { DEFAULT_THEME, type ShippedThemeId } from './theme-choice.ts';

/** The display language: the Mac's own, or one the person picked. */
export type LanguageChoice = 'system' | Language;

/** Every display language a person can pick, in the order the settings window offers them: the Mac's own first. */
export const LANGUAGE_CHOICES: readonly LanguageChoice[] = ['system', ...LANGUAGES];

/** How the person set up the wallpaper, kept in `settings.json` next to the Sources. */
export interface Preferences {
  readonly theme: ShippedThemeId;
  readonly language: LanguageChoice;
  /** The id of the Source that names the scene; null for the first connected one. */
  readonly brand: string | null;
  /** By Gauge role, the id of the Source that feeds it; a role left out follows the brand Source. */
  readonly gauges: Readonly<Partial<Record<GaugeRole, string>>>;
}

/**
 * A change to the preferences: what is left out keeps its value, down to each Gauge role. A Gauge role set to null
 * follows the brand Source again.
 */
export interface PreferencesChange {
  readonly theme?: ShippedThemeId | undefined;
  readonly language?: LanguageChoice | undefined;
  readonly brand?: string | null | undefined;
  readonly gauges?: Readonly<Partial<Record<GaugeRole, string | null | undefined>>> | undefined;
}

/** The preferences of a new install: L'Aéroport in the Mac's language, named after the first Source. */
export const DEFAULT_PREFERENCES: Preferences = { theme: DEFAULT_THEME, language: 'system', brand: null, gauges: {} };
