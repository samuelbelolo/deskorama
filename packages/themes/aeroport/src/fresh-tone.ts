import type { Archetype } from '@deskorama/core';
import type { FlapTone } from './create-flap-field.ts';

/** The Roles that are bad news: only these flip in orange, the colour of something to look at. */
const BAD_NEWS: ReadonlySet<Archetype> = new Set(['error', 'blocked', 'rejection', 'abandon']);

/**
 * Returns the tone of the board's newest row: orange for bad news, bright chalk for anything else, so the colour
 * never says more than the news does.
 * @example
 * freshTone('error'); // "news"
 * freshTone('departure'); // "fresh"
 */
export function freshTone(role: Archetype | null): FlapTone {
  return role !== null && BAD_NEWS.has(role) ? 'news' : 'fresh';
}
