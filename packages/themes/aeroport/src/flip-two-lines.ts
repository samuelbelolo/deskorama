import type { Cancel, Clock } from '@deskorama/core';
import { createFlapField } from './create-flap-field.ts';

/** How long the second line waits after the first, so the two flip one after the other. */
const SECOND_LINE_MS = 900;

/**
 * Appends two split-flap lines of `cells` cells to `parent` and flips them to `lines`, each centred: the first in
 * orange, then the second in chalk, both at once when `instant`. Returns what stops them and takes them down.
 * @example
 * const remove = flipTwoLines(panel, host.clock, ['VOL ANNULÉ', 'PISTE FERMÉE'], { cells: 12, part: 'big-panel', instant: false });
 */
export function flipTwoLines(
  parent: HTMLElement,
  clock: Clock,
  lines: readonly [string, string],
  look: { readonly cells: number; readonly part: string; readonly instant: boolean },
): Cancel {
  const { cells, instant } = look;
  const fields = lines.map((_, i) => createFlapField(cells, clock, `${look.part}-${i}`));
  for (const field of fields) parent.append(field.node);

  const centred = (line: string): string => ' '.repeat(Math.max(0, Math.floor((cells - line.length) / 2))) + line;
  const [first, second] = fields;

  first?.flip(centred(lines[0]), 'news', instant);
  const later = instant ? null : clock.after(SECOND_LINE_MS, () => second?.flip(centred(lines[1]), 'fresh', false));
  if (instant) second?.flip(centred(lines[1]), 'fresh', true);

  return () => {
    later?.();
    for (const field of fields) field.dispose();
    for (const field of fields) field.node.remove();
  };
}
