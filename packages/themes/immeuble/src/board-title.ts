import type { Copy } from './create-copy.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the agency board's title for a width: "SUR <NAME>", else the name alone, else its first word.
 * @example
 * boardTitle(copy, 50); // "SUR TRAMLO"
 */
export function boardTitle(copy: Copy, width: number): string {
  const first = copy.brand.split(' ')[0] ?? copy.brand;
  const options = [copy.fill(copy.text.board.title), copy.brand, first];

  return options.find((text) => textWidth(text) <= width) ?? first;
}
