import { describe, expect, test } from 'vitest';
import { onDrum } from '../src/drum.ts';
import { missingKeys } from './missing-keys.ts';
import { TEXT } from '../src/text-for.ts';

/**
 * Returns every string of a dictionary with its path, walking nested objects.
 * @example
 * leaves({ airport: { name: 'Prod-on-Sea' } }); // [["airport.name", "Prod-on-Sea"]]
 */
function leaves(value: unknown, path = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, path === '' ? key : `${path}.${key}`));
}

describe("L'Aéroport's words", () => {
  test('exist in French and in English, key for key', () => {
    expect(missingKeys(TEXT.fr, TEXT.en)).toEqual([]);
  });

  test('are never empty', () => {
    for (const lang of ['fr', 'en'] as const) {
      const empty = leaves(TEXT[lang]).filter(([, value]) => typeof value !== 'string' || value.trim() === '');
      expect(empty, `${lang}: ${empty.map(([path]) => path).join(', ')}`).toEqual([]);
    }
  });

  test('the parity check catches a key missing on either side', () => {
    const { tower: _tower, ...paint } = TEXT.en.paint;
    const incomplete = { ...TEXT.en, paint };
    expect(missingKeys(TEXT.fr, incomplete)).toEqual(['paint.tower (missing from the second)']);
    expect(missingKeys(incomplete, TEXT.fr)).toEqual(['paint.tower (missing from the first)']);
  });

  test('every word the board flips is on the split-flap drum, in both languages', () => {
    for (const lang of ['fr', 'en'] as const) {
      const { board } = TEXT[lang];
      const flipped = [board.unknown, ...Object.values(board.runwayState), ...Object.values(board.roles)];
      const missing = flipped.filter((word) => onDrum(word) !== word);
      expect({ lang, missing }).toEqual({ lang, missing: [] });
    }
  });

  test('the board’s status words fit their 12 cells', () => {
    for (const lang of ['fr', 'en'] as const) {
      const long = Object.values(TEXT[lang].board.roles).filter((word) => word.length > 12);
      expect({ lang, long }).toEqual({ lang, long: [] });
    }
  });

  test('the French scene paints French words: nothing is left as the English one', () => {
    const shared = new Set(['HANGAR 2', 'MESSAGE', 'AIR PROD']);
    const english = new Map(leaves(TEXT.en));
    const same = leaves(TEXT.fr).filter(([path, word]) => english.get(path) === word && !shared.has(String(word)));

    expect(same.map(([path]) => path)).toEqual([]);
  });
});
