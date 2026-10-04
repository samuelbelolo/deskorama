import type { GaugeValues } from '@deskorama/core';
import { boardLines } from './board-lines.ts';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { hallLines } from './hall-lines.ts';
import type { Layout } from './layout.ts';
import { PAL } from './palette.ts';
import { posterLines } from './poster-lines.ts';
import { mirrorSign } from './mirror-sign.ts';
import { signFrames } from './sign-frames.ts';
import { signHomes } from './sign-homes.ts';
import { signWords } from './sign-words.ts';

/**
 * Mirrors what the ground floor's signs read, over their homes: the board, the poster and the hall's tally.
 * @example
 * mirrorSigns(mirror, copy, layout, { gauges, blocked: 2 });
 */
export function mirrorSigns(
  mirror: Mirror,
  copy: Copy,
  layout: Layout,
  state: { readonly gauges: GaugeValues; readonly blocked: number },
): void {
  const homes = signHomes(layout);
  const frames = signFrames(layout);
  const words: Record<'board' | 'poster' | 'hall', string> = {
    board: signWords(boardLines(copy, state.gauges, frames.board)),
    poster: signWords(posterLines(copy, state.gauges.total, frames.poster, PAL.ink)),
    hall: signWords(hallLines(copy, state.blocked, layout)),
  };

  for (const sign of ['board', 'poster', 'hall'] as const) mirrorSign(mirror, sign, homes[sign], words[sign]);
}
