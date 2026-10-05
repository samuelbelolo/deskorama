import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import type { DraftProblems, SourceDraft } from '../../../shared/source-draft.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { fieldsGroup } from './fields-group.ts';
import { intervalField, type IntervalField } from './interval-field.ts';
import type { PickField } from './pick-field.ts';
import { sheetPicks } from './sheet-picks.ts';
import type { SheetStart } from './sheet-start.ts';

/** Everything a person fills in a connection sheet, and what the sheet reads from it. */
export interface SheetForm {
  /** The display name and the Connector's fields that need no token, as one group. */
  readonly fields: HTMLElement;
  /** The Connector's fields picked from what the token can see, in its own order. */
  readonly picks: readonly PickField[];
  readonly token: HTMLInputElement;
  readonly every: IntervalField;
  /** The values of the Connector's fields that hold one, by key. */
  readonly values: () => Record<string, string>;
  readonly draft: () => SourceDraft;
  /** What a passing test vouches for: where the Source reads and with which token, not its name or its pace. */
  readonly tested: () => string;
  /**
   * Who answers a test, as the person named it: the first field's value when it is a place (a repository, an
   * organization), else the Source's name, else the service.
   */
  readonly where: () => string;
  /** True once a token is typed, or when an edited Source keeps the one in the Keychain. */
  readonly hasToken: () => boolean;
  /** True once every field picked from a list holds what it must. */
  readonly picksFilled: () => boolean;
  /** Marks the fields whose keys are in `problems` as needing a fix, and clears the others. */
  readonly mark: (problems: DraftProblems) => void;
}

/**
 * Returns the form of a connection sheet: the display name, the Connector's fields (those picked from what the
 * token can see apart, since they come after it), the token (a password field, left empty to keep the current one
 * when editing) and the polling interval, holding the values of `start`. A field that holds several opens on the
 * one value a Source saved before it kept.
 * @example
 * const form = sheetForm(github, { id: null, name: '', values: {}, interval: null }, 'fr');
 * form.draft(); // { id: null, connector: 'github', name: '', values: { repository: '' }, token: '', interval: null }
 */
export function sheetForm(connector: ConnectorView, start: SheetStart, lang: Language): SheetForm {
  const text = SETTINGS_TEXT[lang];
  const editing = start.id !== null;

  const group = fieldsGroup(connector, start, lang);
  const every = intervalField(connector.interval, start.interval, lang);
  const picks = sheetPicks(connector, start, lang);

  const token = element('input', {
    className: 'field secure',
    attributes: {
      type: 'password',
      name: 'token',
      autocomplete: 'off',
      spellcheck: 'false',
      'aria-label': text.sheetToken,
      ...(editing ? { placeholder: text.keepToken } : {}),
    },
  });

  const name = (): string => group.name.value();

  const values = (): Record<string, string> => {
    const typed = Array.from(group.controls, ([key, control]) => [key, control.value()] as const);

    return Object.fromEntries([...typed, ...picks.values()]);
  };

  const lists = (): { lists?: Record<string, string[]> } => {
    const held = picks.lists();

    return held === undefined ? {} : { lists: held };
  };

  return {
    fields: group.node,
    picks: picks.all,
    token,
    every,
    values,

    draft: () => ({
      id: start.id,
      connector: connector.id,
      name: name(),
      values: values(),
      ...lists(),
      token: token.value,
      interval: every.value(),
    }),

    tested: () => JSON.stringify([values(), picks.lists() ?? {}, token.value]),

    where() {
      const first = connector.fields[0];
      const isPlace = first !== undefined && first.kind !== 'choice' && first.kind !== 'pick-many';
      const place = isPlace ? (values()[first.key] ?? '').trim() : '';

      return place || name().trim() || connector.title[lang];
    },

    hasToken: () => editing || token.value.trim() !== '',
    picksFilled: () => picks.all.every((pick) => pick.filled()),

    mark(problems) {
      group.name.mark(problems.includes('name'));

      for (const [key, control] of group.controls) control.mark(problems.includes(key));

      for (const pick of picks.all) pick.mark(problems.includes(pick.field.key));

      token.setAttribute('aria-invalid', String(problems.includes('token')));
      every.input.setAttribute('aria-invalid', String(problems.includes('interval')));
    },
  };
}
