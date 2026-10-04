import { PAL } from './palette.ts';
import type { PlaqueRow } from './plaque-row.ts';
import type { PlaqueWords } from './plaque-words.ts';
import { rowTops } from './row-tops.ts';
import { rowWidth } from './row-width.ts';
import { textWidth } from './text-width.ts';
import { wrapWords } from './wrap-words.ts';

/**
 * What dropping the detail costs a block: more than the farthest block in a plaque's reach costs in distance, so the
 * plaque hangs farther away with its detail rather than close without it.
 */
const DETAIL_DROPPED = 400;

/** A plaque's rows for one block, how much they lost, and which parts made it. */
export interface PlaqueLayout {
  readonly rows: readonly PlaqueRow[];
  /** Lower is better: words dropped and cut cost points. */
  readonly penalty: number;
  readonly shown: PlaqueWords;
}

/**
 * Returns the richest rows that fit a native block: sound, fact and detail (the detail after the fact on its row
 * when the block is wide); then without the sound; then the fact alone with its sound; then the fact alone. Never
 * without the fact: null when the fact does not fit.
 * @example
 * layoutPlaque({ sound: 'PAF !', fact: 'PULL REQUEST MERGÉE', detail: '#418' }, 105, 30)?.rows.length; // 2
 */
export function layoutPlaque(words: PlaqueWords, w: number, h: number): PlaqueLayout | null {
  const inner = w < 40 ? w - 2 : w - 4;
  const narrow = inner < 40;
  const fact = wrapWords(words.fact, inner, narrow ? 5 : 3);
  if (fact === null) return null;

  const sound = words.sound;
  const soundScale = sound !== null && textWidth(sound, 2) <= inner && h >= 45 ? 2 : 1;
  const head: PlaqueRow[] =
    sound !== null && textWidth(sound, soundScale) <= inner
      ? [{ text: sound, colour: PAL.lamp, scale: soundScale }]
      : [];
  const factRows: PlaqueRow[] = fact.rows.map((text) => ({ text, colour: PAL.paper, scale: 1 }));
  const detail = words.detail === '' ? null : wrapWords(words.detail, inner, narrow ? 4 : 3);
  const detailRows: PlaqueRow[] = (detail?.rows ?? []).map((text) => ({ text, colour: PAL.haze, scale: 1 }));
  const cuts = (fact.cuts + (detail?.cuts ?? 0)) * 70;

  const withDetail: PlaqueRow[][] = [];
  if (detail !== null) withDetail.push([...factRows, ...detailRows]);
  const [only] = fact.rows;
  if (words.detail !== '' && fact.rows.length === 1 && only !== undefined) {
    const inline = { text: only, tail: words.detail, colour: PAL.paper, scale: 1 };
    if (rowWidth(inline) <= inner) withDetail.push([inline]);
  }

  const withSound = head.length > 0 ? sound : null;
  const options: { readonly rows: readonly PlaqueRow[]; readonly penalty: number; readonly shown: PlaqueWords }[] = [
    ...withDetail.map((rows) => ({ rows: [...head, ...rows], penalty: 0, shown: { ...words, sound: withSound } })),
    ...withDetail.map((rows) => ({ rows, penalty: 60, shown: { ...words, sound: null } })),
    { rows: [...head, ...factRows], penalty: 150, shown: { ...words, sound: withSound, detail: '' } },
    { rows: factRows, penalty: 210, shown: { ...words, sound: null, detail: '' } },
  ];

  for (const { rows, penalty, shown } of options) {
    if (rowTops(rows).height > h || Math.max(...rows.map(rowWidth)) > inner) continue;
    const dropped =
      (shown.sound === null && sound !== null ? 40 : 0) +
      (shown.detail === '' && words.detail !== '' ? DETAIL_DROPPED : 0);
    return { rows, penalty: penalty + dropped + cuts, shown };
  }

  return null;
}
