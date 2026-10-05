import { ARCHETYPES, type Archetype } from './archetype.ts';
import type { Language } from './language.ts';

/** A moment a Theme can be asked to play on its own: one Role, or the failed deploy, its one legendary scene. */
export type ThemeMoment = Archetype | 'failed-deploy';

/** Every moment, in the order they are offered: each Role, then the failed deploy. */
export const THEME_MOMENTS: readonly ThemeMoment[] = [...ARCHETYPES, 'failed-deploy'];

/** Pictures of a Theme as it really draws, as addresses a page can load. */
export interface ThemePictures {
  /** The scene in the afternoon. */
  readonly day: string;
  /** The same scene at night. */
  readonly night: string;
  /** The scene while a failed deploy plays. */
  readonly jackpot: string;
}

/** How a Theme presents itself where a person picks one and tries its Gags. */
export interface ThemeAbout {
  /** A proper noun, kept the same in every language. */
  readonly name: string;
  /** One line of what the scene is. */
  readonly pitch: Readonly<Record<Language, string>>;
  /** One short sentence per moment, saying what the Theme plays for it. */
  readonly gags: Readonly<Record<ThemeMoment, Readonly<Record<Language, string>>>>;
  readonly pictures: ThemePictures;
}
