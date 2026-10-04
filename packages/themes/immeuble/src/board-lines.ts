import type { GaugeValues, Rect } from '@deskorama/core';
import { boardTitle } from './board-title.ts';
import type { Copy } from './create-copy.ts';
import { fitRow } from './fit-row.ts';
import { PAL } from './palette.ts';
import type { SignLine } from './sign-line.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the gauge board in a native frame: "SUR <NAME>", the crowd's word with its value in big digits, today's
 * word with its count. Rows 9 pixels apart, so an accent on a Source's word clears the row above; beside a long word
 * the digits shrink, then turn compact, then the word is cut short: a number never covers its word.
 * @example
 * boardLines(copy, gauges, { x: 3, y: 166, w: 56, h: 28 }); // 5 lines
 */
export function boardLines(copy: Copy, gauges: GaugeValues, frame: Rect): SignLine[] {
  const { x, y, w } = frame;
  const crowd = Math.max(0, Math.round(gauges.crowd));
  const room = w - 6;
  const now = fitRow(
    copy.gaugeWord('crowd'),
    [
      [String(crowd), 2],
      [String(crowd), 1],
      [copy.compact(crowd), 1],
    ],
    room,
  );
  const today = fitRow(
    copy.gaugeWord('daily'),
    [
      [copy.number(gauges.daily), 1],
      [copy.compact(gauges.daily), 1],
    ],
    room,
  );
  const big = now.scale === 2;

  return [
    { text: boardTitle(copy, room), x: x + 3, y: y + 3, scale: 1, colour: PAL.glow },
    { text: now.word, x: x + 3, y: y + 12, scale: 1, colour: PAL.zinc },
    {
      text: now.value,
      x: x + w - 3 - textWidth(now.value, now.scale),
      y: big ? y + 9 : y + 12,
      scale: now.scale,
      colour: PAL.lamp,
    },
    { text: today.word, x: x + 3, y: y + 21, scale: 1, colour: PAL.zinc },
    { text: today.value, x: x + w - 3 - textWidth(today.value), y: y + 21, scale: 1, colour: PAL.glow },
  ];
}
