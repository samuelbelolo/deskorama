import type { Language } from './language.ts';

/** A short line in every display language. */
type Words = Readonly<Record<Language, string>>;

/** What every field of a Connector says of itself. */
interface FieldBase {
  /** The key of the value in the Source's settings. */
  readonly key: string;
  readonly label: Words;
  /**
   * Where to find the value, in one short sentence: shown with a typed field, and with a field picked among loaded
   * options when its value has to be typed by hand.
   */
  readonly hint?: Words;
}

/** A field a person types. */
export interface TypedField extends FieldBase {
  /** `url` must be an `https://` address; `text` is any short line. */
  readonly kind: 'url' | 'text';
  /** An example value, with an `.example` domain for an address. */
  readonly placeholder: string;
}

/** One choice of a {@link ChoiceField}: the value kept in the Source's settings, and its name. */
export interface FieldChoice {
  readonly value: string;
  readonly label: Words;
}

/** A last choice whose value the person types, e.g. the address of a self-hosted copy of the service. */
export interface OtherChoice {
  readonly label: Words;
  /** `url` must be an `https://` address; `text` is any short line. */
  readonly kind: 'url' | 'text';
  readonly placeholder: string;
}

/** A field with a few choices known in advance, one of which is kept. */
export interface ChoiceField extends FieldBase {
  readonly kind: 'choice';
  readonly choices: readonly FieldChoice[];
  /** Lets the person type a value none of the choices holds. */
  readonly other?: OtherChoice;
}

/** What the fields picked among options the Connector loads share. */
interface LoadedField extends FieldBase {
  /** The keys of the fields that must be filled, besides the token, before the options can be loaded. */
  readonly needs: readonly string[];
  /** An example of the value, typed by hand when the options cannot be loaded. */
  readonly placeholder: string;
}

/** A field whose one value is picked among the options the Connector's `listOptions` loads with the token. */
export interface PickOneField extends LoadedField {
  readonly kind: 'pick-one';
}

/** How to say how many values a field holds. */
export interface CountWords {
  /** For exactly one, e.g. "1 project". */
  readonly one: string;
  /** For several, with `{count}` where the number goes, e.g. "{count} projects". */
  readonly many: string;
}

/**
 * A field that holds several values, picked among the options the Connector's `listOptions` loads with the token.
 * They are kept in the `lists` of the Source's settings, never in its `values`.
 */
export interface PickManyField extends LoadedField {
  readonly kind: 'pick-many';
  readonly counted: Readonly<Record<Language, CountWords>>;
  /** What picking none means, said beside the field's label, e.g. "All"; left out when at least one must be picked. */
  readonly none?: Words;
  /** The most that can be picked, when the service sets a limit. */
  readonly max?: number;
  /** The key of the one value this field replaced: a Source saved with it opens with that value picked. */
  readonly formerly?: string;
}

/** One field a person fills in to connect a Source, besides its token. */
export type ConnectorField = TypedField | ChoiceField | PickOneField | PickManyField;
