import type { Copy } from './create-copy.ts';
import type { Layout } from './layout.ts';
import { PAL } from './palette.ts';
import type { SignLine } from './sign-line.ts';
import { stackLines } from './stack-lines.ts';

/**
 * Returns the hall's tally painted on its wall: "INTRUS / BLOQUÉS" over today's count, between the hall's door and its wall.
 * @example
 * hallLines(copy, 3, layout); // INTRUS / BLOQUÉS / 3
 */
export function hallLines(copy: Copy, blocked: number, layout: Layout): SignLine[] {
  const [first, second] = copy.text.hall;
  const rows = [
    { text: first, colour: PAL.paper },
    { text: second, colour: PAL.paper },
    { text: String(Math.max(0, Math.round(blocked))), colour: PAL.ink },
  ];

  return stackLines(rows, 119.5, layout.rdcY + 3);
}
