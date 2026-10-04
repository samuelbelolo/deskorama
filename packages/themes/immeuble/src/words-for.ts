import type { WallpaperEvent } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { plainText } from './plain-text.ts';
import type { PlaqueWords } from './plaque-words.ts';
import { roleOf } from './role-of.ts';

/**
 * Returns what an Event's plaque says: its Role's sound, its label and its detail, ready for the font. A Gag may
 * bring its own sound (the error's burst gets louder).
 * @example
 * wordsFor(copy, approved); // { sound: 'PAF !', fact: 'PULL REQUEST MERGÉE', detail: '#418 CORRIGE LA CONNEXION GOOGLE' }
 */
export function wordsFor(copy: Copy, event: WallpaperEvent, sound?: string | null): PlaqueWords {
  const said = sound === undefined ? copy.text.sounds[roleOf(event)] : sound;

  return {
    sound: said === null ? null : plainText(said),
    fact: plainText(event.label),
    detail: plainText(event.meta.detail),
  };
}
