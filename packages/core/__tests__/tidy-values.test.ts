import { describe, expect, test } from 'vitest';
import { tidyValues } from '../src/tidy-values.ts';

describe('values as a Source keeps them', () => {
  test('are trimmed, never empty, and each kept once where it first came', () => {
    expect(tidyValues([' prj_web ', 'prj_api', '', '  ', 'prj_web'])).toEqual(['prj_web', 'prj_api']);
  });

  test('are none when nothing was given', () => {
    expect(tidyValues([])).toEqual([]);
  });
});
