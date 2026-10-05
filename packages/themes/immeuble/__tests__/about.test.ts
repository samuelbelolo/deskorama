import { LANGUAGES, THEME_MOMENTS } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { IMMEUBLE_ABOUT } from '../src/immeuble-about.ts';

/** Every sentence the Theme says about itself in one language: its pitch, then its line for each moment. */
const SAID = {
  fr: [IMMEUBLE_ABOUT.pitch.fr, ...THEME_MOMENTS.map((moment) => IMMEUBLE_ABOUT.gags[moment].fr)],
  en: [IMMEUBLE_ABOUT.pitch.en, ...THEME_MOMENTS.map((moment) => IMMEUBLE_ABOUT.gags[moment].en)],
} as const;

describe("L'Immeuble's presentation", () => {
  test('has a name, and a pitch in both languages', () => {
    expect(IMMEUBLE_ABOUT.name).toBe('L’Immeuble');
    for (const lang of LANGUAGES) expect(IMMEUBLE_ABOUT.pitch[lang].trim(), `pitch in ${lang}`).not.toBe('');
  });

  test('says what it plays for every Role and for the failed deploy, in both languages', () => {
    expect(Object.keys(IMMEUBLE_ABOUT.gags).toSorted()).toEqual(THEME_MOMENTS.toSorted());

    for (const moment of THEME_MOMENTS) {
      for (const lang of LANGUAGES)
        expect(IMMEUBLE_ABOUT.gags[moment][lang].trim(), `${moment} in ${lang}`).not.toBe('');
    }
  });

  test('never writes an em dash or an en dash', () => {
    for (const lang of LANGUAGES) {
      for (const line of SAID[lang]) expect(line).not.toMatch(/[\u2013\u2014]/);
    }
  });

  test('keeps French typography: curly apostrophes, and no plain space where a non-breaking one belongs', () => {
    for (const line of SAID.fr) {
      expect(line).not.toContain("'");
      expect(line).not.toMatch(/ [:!?»]|« /);
    }
  });

  test.each(['day', 'night', 'jackpot'] as const)('its %s picture is a WebP file that loads', async (moment) => {
    const address = IMMEUBLE_ABOUT.pictures[moment];
    expect(new URL(address).pathname).toMatch(/\.webp$/);

    const picture = new Image();
    picture.src = address;
    await picture.decode();
    expect(picture.naturalWidth).toBeGreaterThan(0);
  });
});
