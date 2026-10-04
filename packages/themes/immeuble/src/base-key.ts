import { isNightTv } from './is-night-tv.ts';
import { lightMode } from './light-mode.ts';
import { skyBands } from './sky-bands.ts';
import type { SkyRow } from './sky-row.ts';

/**
 * Returns what the still layer depends on: the sky's bands, the light, the twenty-minute step of the sun, where the
 * screen sits under the one sky, the TVs of the deep night and the lit rooms. The still layer is redrawn only when it
 * changes.
 * @example
 * baseKey(14, new Set(['f1-0']), { offset: 0, span: 360 }); // "sky,sky,haze|day|42|0/360|false|f1-0"
 */
export function baseKey(hour: number, lit: ReadonlySet<string>, row: SkyRow): string {
  const sky = `${skyBands(hour).join()}|${lightMode(hour)}|${Math.floor(hour * 3)}|${row.offset}/${row.span}`;

  return `${sky}|${isNightTv(hour)}|${[...lit].toSorted().join()}`;
}
