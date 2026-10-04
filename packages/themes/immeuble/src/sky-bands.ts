import type { Colour } from './palette.ts';

/** Stepped sky keyframes: from this hour on, these bands top to bottom, with no blending, like a 16-bit game. */
const SKIES: readonly (readonly [number, readonly [Colour, Colour, Colour]])[] = [
  [0, ['night', 'night', 'dusk']],
  [5, ['night', 'dusk', 'dawn']],
  [6.5, ['dusk', 'dawn', 'glow']],
  [8, ['sky', 'sky', 'haze']],
  [17.5, ['sky', 'haze', 'glow']],
  [19, ['dusk', 'dawn', 'lamp']],
  [20.5, ['night', 'dusk', 'dawn']],
  [21.5, ['night', 'night', 'dusk']],
];

/**
 * Returns the three sky bands of an hour, top to bottom.
 * @example
 * skyBands(14); // ["sky", "sky", "haze"]
 */
export function skyBands(hour: number): readonly [Colour, Colour, Colour] {
  let bands = SKIES[0]?.[1] ?? (['night', 'night', 'dusk'] as const);
  for (const [from, colours] of SKIES) if (hour >= from) bands = colours;

  return bands;
}
