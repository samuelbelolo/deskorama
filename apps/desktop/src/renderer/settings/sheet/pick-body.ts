import type { ConnectorFailure, ConnectorOption, Language, PickManyField, PickOneField } from '@deskorama/core';
import { element } from '../element.ts';
import { sourceStanding } from '../source-standing.ts';
import { statusLine } from '../status-line.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { pickByHand } from './pick-by-hand.ts';
import { pickChecklist } from './pick-checklist.ts';
import { pickSelect } from './pick-select.ts';
import { pickUnlisted } from './pick-unlisted.ts';

/** Where the list of a field stands: waiting for what it needs, loading, loaded, or refused by the service. */
export type PickState =
  | { readonly kind: 'waiting'; readonly note: string }
  | { readonly kind: 'loading' }
  | { readonly kind: 'loaded'; readonly options: readonly ConnectorOption[] }
  | { readonly kind: 'failed'; readonly failure: ConnectorFailure };

/** What a state of a field's list is drawn from, and whom it tells. */
export interface PickBodyOptions {
  readonly field: PickOneField | PickManyField;
  /** The values the field holds when the state is drawn. */
  readonly picked: readonly string[];
  readonly lang: Language;
  /** Called with the values picked or typed, each time they change. */
  readonly onChange: (picked: string[]) => void;
  /**
   * Called with a value typed beside a loaded list that lacks it, trimmed and never empty; `again` is true when the
   * person confirmed it with the Return key, and may type another.
   */
  readonly onAdd: (value: string, again: boolean) => void;
}

/** One state of a field's list, drawn. */
export interface PickBody {
  /** What goes under the field's label. */
  readonly body: Node[];
  /** What goes beside it: how many are ticked and, for a long list, the field that narrows it. */
  readonly aside: Node[];
}

/**
 * Returns one state of a field's list, drawn: what it waits for, the loading, the options as a pop-up button or as
 * checkboxes, over a line to type a value they lack, and, when the service listed nothing or refused, a field to
 * type the value in, under the refusal in the app's own words, which names the missing permission.
 * @example
 * const failed = { kind: 'failed', failure: { kind: 'permission', permission: 'org:read' } };
 * pickBody(failed, { field, picked: [], lang: 'en', onChange, onAdd });
 * // body: ["The token lacks the “org:read” permission.", a field to type in], aside: []
 */
export function pickBody(state: PickState, options: PickBodyOptions): PickBody {
  const { field, picked, lang, onChange } = options;
  const text = SETTINGS_TEXT[lang];

  if (state.kind === 'waiting')
    return { body: [element('p', { className: 'pick-note', text: state.note })], aside: [] };

  if (state.kind === 'loading') return { body: [statusLine('wait', text.pickLoading)], aside: [] };

  if (state.kind === 'failed') {
    const standing = sourceStanding({ state: 'failing', failure: state.failure, at: 0 }, lang);

    return { body: [statusLine(standing.kind, standing.sentence), pickByHand(options)], aside: [] };
  }

  if (state.options.length === 0) {
    return { body: [element('p', { className: 'pick-note', text: text.pickEmpty }), pickByHand(options)], aside: [] };
  }

  const unlisted = pickUnlisted({ field, lang, onAdd: options.onAdd });

  if (field.kind === 'pick-many') {
    const { list, count, filter } = pickChecklist({ field, listed: state.options, picked, lang, onChange });

    return { body: [list, unlisted], aside: filter === null ? [count] : [count, filter] };
  }

  const select = pickSelect({
    field,
    listed: state.options,
    picked: picked[0] ?? '',
    lang,
    onChange: (value) => onChange(value === '' ? [] : [value]),
  });

  return { body: [select, unlisted], aside: [] };
}
