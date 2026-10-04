import type { Gag } from './gag.ts';

/**
 * Returns a Gag that plays its pictures in turn, so a busy Role never shows the same one twice in a row; when the
 * picture due finds no room, the next one gets its chance.
 * @example
 * const playMoney = alternate([playRegister, playPiggyBank]);
 */
export function alternate(gags: readonly Gag[]): Gag {
  let turn = 0;

  return (event, env) => {
    for (let i = 0; i < gags.length; i += 1) {
      const act = gags[(turn + i) % gags.length]?.(event, env) ?? null;
      if (act === null) continue;

      turn = (turn + i + 1) % gags.length;
      return act;
    }

    return null;
  };
}
