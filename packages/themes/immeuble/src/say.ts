import type { Rect, WallpaperEvent } from '@deskorama/core';
import { fitPlaque } from './fit-plaque.ts';
import type { GagEnv } from './gag.ts';
import type { Plaque } from './plaque.ts';
import { plaqueSpan } from './timing.ts';
import { wordsFor } from './words-for.ts';

/**
 * Fits an Event's plaque next to its actor, held for the Gag's whole run, its key pose and the Caption's late
 * glance. When nothing near the actor can hold the fact with its detail, it hangs anywhere visible that holds both,
 * joined by a longer leader, and only then loses its detail; null when nothing visible can hold the fact, and the
 * Gag then waits, since it never plays without its fact.
 * @example
 * say(env, event, { x: 135, y: 165, w: 45, h: 30 }, 2600, { avoid: [stage] });
 */
export function say(
  env: GagEnv,
  event: WallpaperEvent,
  anchor: Rect,
  duration: number,
  options: { readonly sound?: string | null; readonly avoid?: readonly Rect[] } = {},
): Plaque | null {
  const words = wordsFor(env.copy, event, options.sound);
  const hold = plaqueSpan(duration);
  const avoid = options.avoid ?? [];

  const near = fitPlaque(env.place, words, anchor, { hold, avoid });
  if (near !== null && near.shown.detail === words.detail) return near;

  const whole = fitPlaque(env.place, words, anchor, {
    hold,
    avoid: near === null ? avoid : [...avoid, near.spot],
    reach: Infinity,
    whole: true,
  });
  if (whole === null) return near ?? fitPlaque(env.place, words, anchor, { hold, avoid, reach: Infinity });

  near?.spot.release();
  return whole;
}
