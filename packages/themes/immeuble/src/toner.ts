import type { LightMode } from './light-mode.ts';
import { PAL, type Colour, type Tone } from './palette.ts';

/** What each colour becomes on unlit surfaces after dark. Lit rooms keep their day colours. */
const NIGHT: Partial<Record<Colour, Colour>> = {
  stone: 'zinc',
  stone2: 'slate',
  umber: 'dusk',
  wood: 'night',
  zinc: 'slate',
  slate: 'dusk',
  leaf: 'moss',
  moss: 'night',
  haze: 'zinc',
  paper: 'haze',
  sky: 'dusk',
  litwall: 'umber',
  skin: 'stone2',
  skin2: 'umber',
  denim: 'dusk',
  dawn: 'umber',
  glow: 'stone',
};

/** Around dawn and dusk: half a step toward the night. */
const TWILIGHT: Partial<Record<Colour, Colour>> = {
  stone: 'stone2',
  stone2: 'umber',
  haze: 'zinc',
  paper: 'stone',
  zinc: 'slate',
  leaf: 'moss',
  sky: 'zinc',
};

/** No swap: the colours as they are. */
const DAY: Partial<Record<Colour, Colour>> = {};

/** The swap table of each light. */
const SWAPS: Readonly<Record<LightMode, Partial<Record<Colour, Colour>>>> = {
  day: DAY,
  twilight: TWILIGHT,
  night: NIGHT,
};

/**
 * Returns the tone of a light: the 16-bit palette swap that turns limestone to moonlit zinc after dark.
 * @example
 * toner('night')('stone'); // "#8796a8"
 * toner('day')('stone'); // "#dccaa4"
 */
export function toner(mode: LightMode): Tone {
  const swap = SWAPS[mode];

  return (name) => PAL[swap[name] ?? name];
}
