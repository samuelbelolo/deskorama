import type { Random } from '@deskorama/core';
import type { Lines } from './strings.ts';

/**
 * Returns one of three variants of a line, drawn with the seeded random generator.
 * @example
 * pickLine(textFor('en').lines.bot, host.random); // "Beep. Not mine."
 */
export function pickLine(lines: Lines, random: Random): string {
  return lines[Math.floor(random.next() * lines.length)] ?? lines[0];
}
