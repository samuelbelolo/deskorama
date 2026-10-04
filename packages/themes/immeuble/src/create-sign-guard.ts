import type { Cancel, Rect, ScreenHost } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { craneDays } from './crane-days.ts';
import { TILE } from './grid.ts';
import { mirrorSign } from './mirror-sign.ts';
import { signWords } from './sign-words.ts';
import { siteSignLines } from './site-sign-lines.ts';
import type { SiteState } from './site-state.ts';
import { siteStatusOf } from './site-status-of.ts';

/** What keeps the site sign free of Gags and read aloud wherever it hangs. */
export interface SignGuard {
  /** Reserves the sign where it hangs now and mirrors what it reads, when either changed. */
  keep(rect: Rect, state: SiteState, now: number): void;
  /** Gives the reservation back. */
  release(): void;
}

/**
 * Returns the guard of one screen's site sign: it reserves the tiles under the sign, again only when the sign moves
 * to other tiles, and mirrors its words, again only when they change.
 * @example
 * const guard = createSignGuard(host, copy, mirror);
 * guard.keep(toStage(signBox), state, clock.now());
 */
export function createSignGuard(host: ScreenHost, copy: Copy, mirror: Mirror): SignGuard {
  let release: Cancel | null = null;
  let reservedAt = '';
  let mirrored = '';

  return {
    keep(rect, state, now) {
      const words = signWords(siteSignLines(copy, craneDays(state, now), siteStatusOf(copy, state, now), 0, 0));
      const tiles = `${Math.floor(rect.x / TILE)},${Math.floor(rect.y / TILE)}`;
      if (words !== mirrored || tiles !== reservedAt) mirrorSign(mirror, 'site', rect, words);
      mirrored = words;
      if (tiles === reservedAt) return;

      release?.();
      release = host.reserve(rect);
      reservedAt = tiles;
    },
    release: () => release?.(),
  };
}
