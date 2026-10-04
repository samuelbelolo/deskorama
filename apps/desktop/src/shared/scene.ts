import type { Language, SourceProfile } from '@deskorama/core';
import type { ShippedThemeId } from './theme-choice.ts';

/** What every wallpaper page draws: which Theme, in which language, named after which Source. */
export interface Scene {
  readonly theme: ShippedThemeId;
  readonly lang: Language;
  /** The brand Source's name, with the words of each Gauge taken from the Source that feeds it. */
  readonly source: SourceProfile;
}
