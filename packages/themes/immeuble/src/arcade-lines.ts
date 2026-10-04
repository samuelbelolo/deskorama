import type { Copy } from './create-copy.ts';
import { PAL } from './palette.ts';

/** When the countdown starts, after the collapse, and when the game is over for good. */
const COUNT_FROM = 1900;
export const OVER_FROM: number = COUNT_FROM + 7600;

/** One line of the arcade box: its words, colour and scale, and whether it blinks. */
export interface ArcadeLine {
  readonly text: string;
  readonly colour: string;
  readonly scale: number;
  readonly blinks: boolean;
}

/**
 * Returns what the arcade box says `t` ms after the failure: the title, the countdown from 9 (then the goodbye) and
 * the coin line. A tall box shows all three, the countdown big when it fits; a strip shows the title over the
 * countdown and the coin line taking turns.
 * @example
 * arcadeLines(copy, 3000, { tall: true, fits: (text, scale) => textWidth(text, scale) <= 114 }).map((line) => line.text);
 * // ["FIN DE PARTIE", "CONTINUER ? 8", "INSÉREZ UNE PIÈCE"]
 */
export function arcadeLines(
  copy: Copy,
  t: number,
  box: { readonly tall: boolean; readonly fits: (text: string, scale: number) => boolean },
): ArcadeLine[] {
  const words = copy.text.arcade;
  const left = Math.max(0, 9 - Math.floor((t - COUNT_FROM) / 800));
  const ask = t > OVER_FROM ? copy.fill(words.end) : copy.fill(words.ask, { n: left });
  const title = { text: copy.fill(words.title), colour: PAL.accent, scale: 1, blinks: false };
  const coin = { text: copy.fill(words.coin), colour: PAL.paper, scale: 1, blinks: box.tall };

  if (!box.tall) return [title, Math.floor(t / 1200) % 2 === 1 ? coin : { ...coin, text: ask, blinks: false }];

  return [title, { text: ask, colour: PAL.paper, scale: box.fits(ask, 2) ? 2 : 1, blinks: false }, coin];
}
