import type { Archetype } from '@deskorama/core';

/** A word in its singular and plural forms, picked by the language's plural rules. */
export type Forms = readonly [one: string, other: string];

/**
 * Every word L'Immeuble draws by itself, in one language, in capitals for the bitmap font. Event words (the fact,
 * the detail, the tag) come from the Event; sign headings come from the Source's Gauges; nothing here names a Source.
 */
export interface Strings {
  /** The sound of each Role's Gag on its plaque, dropped first when room runs out; null when the Gag is silent. */
  readonly sounds: Readonly<Record<Archetype | 'other', string | null>>;
  /** The error Gag's sound as a burst gets worse: first, second, third and later. */
  readonly errors: readonly [string, string, string];
  /** Words painted on props: the parcel's "VIA", the checkpoint's sign, the stamp without a tag, the new label. */
  readonly props: { readonly via: string; readonly stop: string; readonly ok: string; readonly plusOne: string };
  /** The agency board's title, `{brand}` filled with the Source's name. */
  readonly board: { readonly title: string };
  /** The crane's site sign: "30 JOURS SANS / ACCIDENT / DE MISE EN LIGNE", then what the site is doing. */
  readonly site: {
    readonly days: Forms;
    readonly what: string;
    readonly idle: string;
    readonly building: string;
    /** `{time}` filled with when the last deploy went live. */
    readonly live: string;
  };
  /** The hall's tally of intruders kept out today, on two rows. */
  readonly hall: readonly [string, string];
  /** The arcade box of the failed-deploy scene, `{n}` filled with the countdown. */
  readonly arcade: {
    readonly title: string;
    readonly ask: string;
    readonly end: string;
    readonly coin: string;
  };
  /** What a screen reader announces for the whole picture. */
  readonly description: string;
}
