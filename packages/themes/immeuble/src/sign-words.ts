import type { SignLine } from './sign-line.ts';

/**
 * Returns what a sign reads, its lines joined in reading order, for the mirror.
 * @example
 * signWords(hallLines(copy, 2, layout)); // "INTRUS BLOQUÉS 2"
 */
export function signWords(lines: readonly SignLine[]): string {
  return lines.map((line) => line.text).join(' ');
}
