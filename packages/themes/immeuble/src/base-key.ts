import { isNightTv } from './is-night-tv.ts';
import { lightMode } from './light-mode.ts';
import { skyBands } from './sky-bands.ts';

/**
 * Returns what the still layer depends on: the sky's bands, the light, the twenty-minute step of the sun, the TVs of
 * the deep night and the lit rooms. The still layer is redrawn only when it changes.
 * @example
 * baseKey(14, new Set(['f1-0'])); // "sky,sky,haze|day|42|false|f1-0"
 */
export function baseKey(hour: number, lit: ReadonlySet<string>): string {
  return `${skyBands(hour).join()}|${lightMode(hour)}|${Math.floor(hour * 3)}|${isNightTv(hour)}|${[...lit].toSorted().join()}`;
}
