import type { LightMode } from './light-mode.ts';
import type { Tone } from './palette.ts';
import { toner } from './toner.ts';

/**
 * Returns the tone of an unlit room or a closed shop: a step darker by day, the night swap after dark.
 * @example
 * dimToner('day')('stone'); // "#b79f78"
 */
export function dimToner(mode: LightMode): Tone {
  return toner(mode === 'day' ? 'twilight' : 'night');
}
