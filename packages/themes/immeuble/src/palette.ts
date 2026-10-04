/**
 * The locked palette of the building, 22 colours drawn from a Paris street: nothing outside this table is ever
 * drawn. Amber (`lamp`, `glow`) is the light of the street and of the lit displays; vermilion (`accent`) is kept for
 * news only: a stamp, a heart, an alarm.
 */
export const PAL = {
  ink: '#1d1b26',
  night: '#262a45',
  dusk: '#3d4466',
  slate: '#5d6b85',
  zinc: '#8796a8',
  sky: '#9cc3dc',
  haze: '#cfe2ea',
  paper: '#f3ecdc',
  stone: '#dccaa4',
  stone2: '#b79f78',
  umber: '#7a5e48',
  wood: '#5a3d30',
  lamp: '#f7c95c',
  glow: '#fce7a1',
  litwall: '#e9b06e',
  leaf: '#5f8f5a',
  moss: '#3b5e46',
  skin: '#e9b48e',
  skin2: '#a8694c',
  denim: '#4a6fa8',
  dawn: '#e88a5e',
  accent: '#e2432a',
} as const;

/** The name of one colour of the palette. */
export type Colour = keyof typeof PAL;

/** Maps a colour name to the hex it is painted with under one light. */
export type Tone = (name: Colour) => string;
