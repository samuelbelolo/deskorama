import type { Archetype, DeployStep, GaugeMove, Rarity } from '@deskorama/core';

/** The words of a posted Event in one language, with its defaults filled in. */
export interface PostedText {
  readonly label: string;
  readonly detail: string;
  readonly tag: string;
}

/**
 * One Event in its JSON form (posted to the Local webhook or returned by a Feed), once validated and with its
 * defaults filled in, with its words in French, English or both.
 */
export interface PostedEvent {
  readonly id?: string | undefined;
  readonly kind: string;
  readonly archetype: Archetype | null;
  readonly recognised: boolean;
  readonly rarity: Rarity;
  readonly source: string;
  /** ISO 8601 with a time zone. */
  readonly at?: string | undefined;
  readonly text: { readonly fr?: PostedText | undefined; readonly en?: PostedText | undefined };
  readonly step?: DeployStep | undefined;
  readonly gauge?: GaugeMove | undefined;
}
