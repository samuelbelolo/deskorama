import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import type { DraftProblems, SourceDraft } from '../../../shared/source-draft.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { fieldsGroup } from './fields-group.ts';
import { intervalField, type IntervalField } from './interval-field.ts';
import type { SheetStart } from './sheet-start.ts';

/** Everything a person types in a connection sheet, and what the sheet reads from it. */
export interface SheetForm {
  /** The display name and the Connector's fields, as one group. */
  readonly fields: HTMLElement;
  readonly token: HTMLInputElement;
  readonly every: IntervalField;
  /** The values of the Connector's fields, by key. */
  readonly values: () => Record<string, string>;
  readonly draft: () => SourceDraft;
  /** What a passing test vouches for: where the Source reads and with which token, not its name or its pace. */
  readonly tested: () => string;
  /** Who answers a test, as the person named it: the first field's value, else the Source's name, else the service. */
  readonly where: () => string;
  /** True once a token is typed, or when an edited Source keeps the one in the Keychain. */
  readonly hasToken: () => boolean;
  /** Marks the inputs whose keys are in `problems` as needing a fix, and clears the others. */
  readonly mark: (problems: DraftProblems) => void;
}

/**
 * Returns the form of a connection sheet: the display name, the Connector's fields, the token (a password field,
 * left empty to keep the current one when editing) and the polling interval, holding the values of `start`.
 * @example
 * const form = sheetForm(github, { id: null, name: '', values: {}, interval: null }, 'fr');
 * form.draft(); // { id: null, connector: 'github', name: '', values: { repository: '' }, token: '', interval: null }
 */
export function sheetForm(connector: ConnectorView, start: SheetStart, lang: Language): SheetForm {
  const text = SETTINGS_TEXT[lang];
  const editing = start.id !== null;

  const group = fieldsGroup(connector, start, lang);
  const every = intervalField(connector.interval, start.interval, lang);

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

  const name = (): string => group.inputs.get('name')?.value ?? '';

  const values = (): Record<string, string> =>
    Object.fromEntries(connector.fields.map((field) => [field.key, group.inputs.get(field.key)?.value ?? '']));

  return {
    fields: group.node,
    token,
    every,
    values,

    draft: () => ({
      id: start.id,
      connector: connector.id,
      name: name(),
      values: values(),
      token: token.value,
      interval: every.value(),
    }),

    tested: () => JSON.stringify([values(), token.value]),

    where() {
      const first = connector.fields[0];
      const place = first === undefined ? '' : (values()[first.key] ?? '').trim();

      return place || name().trim() || connector.title[lang];
    },

    hasToken: () => editing || token.value.trim() !== '',

    mark(problems) {
      for (const [key, input] of [...group.inputs, ['token', token] as const, ['interval', every.input] as const]) {
        input.setAttribute('aria-invalid', String(problems.includes(key)));
      }
    },
  };
}
