import type { Cancel, Clock, Point } from '@deskorama/core';
import { flipTwoLines } from './flip-two-lines.ts';
import type { PanelSize } from './panel-sizes.ts';

/**
 * Puts up the giant two-line split-flap panel that only a failed deploy shows, its top-left corner at `at`: the
 * first line flips in orange, then the second in chalk, at once when `instant`, as the board's takeover does.
 * Returns what takes it down.
 * @example
 * const remove = createBigPanel(layer, host.clock, ['VOL ANNULÉ', 'PISTE FERMÉE'], { at: { x: 120, y: 200 }, size, instant: false });
 */
export function createBigPanel(
  parent: HTMLElement,
  clock: Clock,
  lines: readonly [string, string],
  place: { readonly at: Point; readonly size: PanelSize; readonly instant: boolean },
): Cancel {
  const { size, at, instant } = place;

  const panel = document.createElement('div');
  panel.className = 'aeroport-big-panel';
  panel.dataset['part'] = 'big-panel';
  panel.style.transform = `translate(${Math.round(at.x)}px, ${Math.round(at.y)}px)`;
  panel.style.width = `${size.w}px`;
  panel.style.height = `${size.h}px`;
  panel.style.setProperty('--cell-w', `${size.cell.w}px`);
  panel.style.setProperty('--cell-h', `${size.cell.h}px`);
  panel.style.setProperty('--cell-font', `${size.cell.font}px`);
  panel.style.setProperty('--cell-gap', `${size.cell.gap}px`);
  parent.append(panel);

  const remove = flipTwoLines(panel, clock, lines, { cells: size.cells, part: 'big-panel-line', instant });

  return () => {
    remove();
    panel.remove();
  };
}
