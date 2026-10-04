import { onFrameAtMost, type Cancel, type Clock } from '@deskorama/core';
import { onDrum } from './drum.ts';
import { flapPath } from './flap-path.ts';
import { REDRAW_FPS } from './redraw-rate.ts';

/** How long one flap takes to fall. */
const FLAP_MS = 64;

/** A row of split-flap cells that flip to a new word. */
export interface FlapField {
  readonly node: HTMLElement;
  /** Flips to `text`, padded or cut to the field's cells; `tone` colours the whole field. */
  readonly flip: (text: string, tone: FlapTone, instant: boolean) => void;
  readonly dispose: Cancel;
}

/** How a field reads: plain chalk, the bright newest row, orange bad news, or dimmed as an older row. */
export type FlapTone = 'plain' | 'fresh' | 'news' | 'dim';

/**
 * Returns a field of `cells` split-flap cells. Each changed cell falls through the drum to its new letter, one flap
 * every {@link FLAP_MS}, redrawn from the Clock only while some cell moves; with `instant` (reduced motion, or the
 * first fill at mount) the letters land at once.
 * @example
 * const status = createFlapField(12, host.clock, 'board-status');
 * status.flip('MERGÉE', 'news', false);
 */
export function createFlapField(cells: number, clock: Clock, part: string): FlapField {
  const node = document.createElement('span');
  node.className = 'aeroport-flaps';
  node.dataset['part'] = part;

  const spans = Array.from({ length: cells }, () => {
    const cell = document.createElement('span');
    cell.className = 'aeroport-flap';
    cell.textContent = ' ';
    node.append(cell);
    return cell;
  });

  let moving: Cancel | null = null;

  const flip = (text: string, tone: FlapTone, instant: boolean): void => {
    node.dataset['tone'] = tone;
    const target = onDrum(text).padEnd(cells, ' ').slice(0, cells);
    const paths = spans.map((cell, i) => flapPath(cell.textContent ?? ' ', target[i] ?? ' '));

    moving?.();
    moving = null;

    if (instant) {
      spans.forEach((cell, i) => (cell.textContent = target[i] ?? ' '));
      return;
    }

    const start = clock.now();
    moving = onFrameAtMost(clock, REDRAW_FPS, (now) => {
      const step = Math.floor((now - start) / FLAP_MS);
      let done = true;
      spans.forEach((cell, i) => {
        const path = paths[i] ?? [];
        const letter = path[Math.min(step, path.length - 1)];
        if (letter !== undefined) cell.textContent = letter;
        if (step < path.length - 1) done = false;
      });
      if (done) {
        moving?.();
        moving = null;
      }
    });
  };

  return {
    node,
    flip,
    dispose: () => moving?.(),
  };
}
