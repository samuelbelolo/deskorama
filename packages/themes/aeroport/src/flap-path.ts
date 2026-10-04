import { DRUM } from './drum.ts';

/** A cell never flips through more than this many letters: a real module's short run, readable in a still. */
const MAX_FLAPS = 7;

/**
 * Returns the letters a split-flap cell shows on its way from `from` to `to`, the last one being `to`: the drum's
 * order, cut to its last {@link MAX_FLAPS} flaps. A letter off the drum lands at once.
 * @example
 * flapPath('A', 'D'); // ["B", "C", "D"]
 * flapPath('D', 'D'); // []
 * flapPath(' ', 'Z'); // ["T", "U", "V", "W", "X", "Y", "Z"]
 */
export function flapPath(from: string, to: string): string[] {
  if (from === to) return [];

  const start = DRUM.indexOf(from);
  const end = DRUM.indexOf(to);
  if (start < 0 || end < 0) return [to];

  const path: string[] = [];
  for (let i = (start + 1) % DRUM.length; i !== end; i = (i + 1) % DRUM.length) path.push(DRUM[i] ?? ' ');
  path.push(to);

  return path.slice(-MAX_FLAPS);
}
