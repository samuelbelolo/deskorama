import type { GaugeValues, Rect } from '@deskorama/core';
import { boardTitle } from './board-title.ts';
import type { Copy } from './create-copy.ts';
import { fitStack } from './fit-stack.ts';
import { PAL } from './palette.ts';
import type { SignLine } from './sign-line.ts';
import type { StackRow } from './stack-lines.ts';
import { totalRows } from './total-rows.ts';

/** Which home a blade sign stands in for: the agency board or the kiosk poster. */
export type BladeKind = 'board' | 'poster';

/**
 * Returns a Gauge's word as a stack row, in grey.
 * @example
 * word('COMMITS'); // { text: 'COMMITS', colour: PAL.zinc }
 */
function word(text: string): StackRow {
  return { text, colour: PAL.zinc };
}

/**
 * Returns a Gauge's value as a stack row, in amber, at a scale.
 * @example
 * value('9', 2); // { text: '9', colour: PAL.lamp, scale: 2 }
 */
function value(text: string, scale = 1): StackRow {
  return { text, colour: PAL.lamp, scale };
}

/**
 * Returns a blade sign's lines in its native frame, the same plain words as its home: the board's title, the crowd
 * and today's count, or the total's heading and value. The richest layout that fits is kept, the main number in big
 * digits when there is room, the bare numbers when the Source's words are long.
 * @example
 * bladeLines(copy, gauges, 'board', { x: 75, y: 61, w: 45, h: 43 }); // SUR TRAMLO / ACTIFS / 9 / COMMITS / 23
 */
export function bladeLines(copy: Copy, gauges: GaugeValues, kind: BladeKind, frame: Rect): SignLine[] {
  if (kind === 'poster') {
    const heading = totalRows(copy, frame.w - 4).map((text) => ({ text, colour: PAL.zinc }));
    const total = copy.number(gauges.total);
    return fitStack(
      [
        [...heading, { text: total, colour: PAL.lamp, scale: 2 }],
        [...heading, { text: total, colour: PAL.lamp }],
        [{ text: total, colour: PAL.lamp }],
      ],
      frame,
    );
  }

  const title: StackRow = { text: boardTitle(copy, frame.w - 4), colour: PAL.glow };
  const crowdWord = copy.gaugeWord('crowd');
  const dailyWord = copy.gaugeWord('daily');
  const crowd = String(Math.max(0, Math.round(gauges.crowd)));
  const daily = copy.number(gauges.daily);

  return fitStack(
    [
      [title, word(crowdWord), value(crowd, 2), word(dailyWord), value(daily)],
      [title, word(crowdWord), value(crowd), word(dailyWord), value(daily)],
      [title, value(`${crowdWord} ${crowd}`), value(`${dailyWord} ${daily}`)],
      [title, word(crowdWord), value(crowd), value(daily)],
      [word(crowdWord), value(crowd), value(daily)],
      [value(crowd), value(daily)],
    ],
    frame,
  );
}
