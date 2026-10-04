import type { Cancel, Clock } from '@deskorama/core';
import { flipTwoLines } from './flip-two-lines.ts';

/** The cells of one full-width line laid over a row: the time, flight and status columns and their gaps. */
export const TAKEOVER_CELLS = 30;

/**
 * Lays two full-width split-flap lines over the board's first two rows and flips them to `lines`, centred, the first
 * in orange. Returns what takes the lines down and shows the rows again.
 * @example
 * const handBack = takeOverRows(frame.rows, host.clock, ['VOL ANNULÉ', 'PISTE FERMÉE'], false);
 * handBack();
 */
export function takeOverRows(
  rows: HTMLElement,
  clock: Clock,
  lines: readonly [string, string],
  instant: boolean,
): Cancel {
  const overlay = document.createElement('div');
  overlay.className = 'aeroport-board-takeover';
  overlay.dataset['part'] = 'board-takeover';
  rows.append(overlay);

  const remove = flipTwoLines(overlay, clock, lines, { cells: TAKEOVER_CELLS, part: 'board-takeover', instant });

  return () => {
    remove();
    overlay.remove();
  };
}
