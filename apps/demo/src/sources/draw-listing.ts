import type { Language, Random } from '@deskorama/core';
import { between } from './between.ts';
import { CITIES, LISTING_TYPES, type ListingType } from './bailix-words.ts';
import { pick } from './pick.ts';

/** A home drawn from Bailix's listings. */
export interface Listing {
  readonly type: ListingType;
  readonly city: string;
  readonly rent: number;
  /** "T2, Lyon 3e, 780 €" in French, "2-room flat, Lyon 3e, €780" in English. */
  readonly detail: Readonly<Record<Language, string>>;
  /** "T2 780 €", short enough for a suitcase label. */
  readonly tag: Readonly<Record<Language, string>>;
}

/**
 * Draws a listing of Bailix, the invented rental app: a kind of home by how common it is, a city and a rent.
 * @example
 * drawListing(random).detail.fr; // "T2, Lyon 3e, 780 €"
 * drawListing(random).tag.en; // "2-ROOM €780"
 */
export function drawListing(random: Random): Listing {
  const type = pickByWeight(random.next());

  const rent = between(random, type.rent[0], type.rent[1], 10);
  const city = pick(random, CITIES);

  return {
    type,
    city,
    rent,
    detail: { fr: `${type.name.fr}, ${city}, ${rent} €`, en: `${type.name.en}, ${city}, €${rent}` },
    tag: { fr: `${type.short.fr} ${rent} €`, en: `${type.short.en} €${rent}` },
  };
}

/**
 * Returns the kind of home a draw from 0 to 1 lands on, each kind taking a share of the range as large as its weight.
 * @example
 * pickByWeight(0); // the studio, first in the list
 * pickByWeight(0.99); // the flatshare, last in the list
 */
function pickByWeight(draw: number): ListingType {
  const total = LISTING_TYPES.reduce((sum, each) => sum + each.weight, 0);
  let reached = 0;

  for (const type of LISTING_TYPES) {
    reached += type.weight / total;
    if (draw < reached) return type;
  }

  const last = LISTING_TYPES.at(-1);
  if (last === undefined) throw new Error('Bailix lists no kind of home.');

  return last;
}
