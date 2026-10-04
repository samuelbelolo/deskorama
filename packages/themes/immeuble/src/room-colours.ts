import { dimToner } from './dim-toner.ts';
import type { LightMode } from './light-mode.ts';
import { LIT } from './lit.ts';
import { PAL, type Tone } from './palette.ts';

/** How a room is painted: its wall, the shade under the ceiling, the floor, and the tone of its furniture. */
export interface RoomColours {
  readonly wall: string;
  readonly shade: string;
  readonly floor: string;
  readonly tone: Tone;
  /** Names the tone in the sprite cache. */
  readonly toneName: string;
}

/**
 * Returns the colours of a room for its light: a lit room glows warm; by day an empty flat keeps the limestone and
 * day colours, only its lamp and tenant missing; at dusk and at night it takes the cool swap.
 * @example
 * roomColours(true, 'night').wall; // "#e9b06e"
 * roomColours(false, 'night').wall; // "#262a45"
 */
export function roomColours(on: boolean, mode: LightMode): RoomColours {
  if (on) return { wall: PAL.litwall, shade: PAL.stone2, floor: PAL.wood, tone: LIT, toneName: 'day' };
  if (mode === 'day') return { wall: PAL.stone2, shade: PAL.umber, floor: PAL.wood, tone: LIT, toneName: 'day' };

  const tone = dimToner(mode);

  return {
    wall: mode === 'twilight' ? PAL.dusk : PAL.night,
    shade: PAL.night,
    floor: tone('wood'),
    tone,
    toneName: `dim-${mode}`,
  };
}
