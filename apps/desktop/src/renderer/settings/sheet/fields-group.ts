import type { Language } from '@deskorama/core';
import { MAX_NAME_LENGTH } from '../../../shared/max-name-length.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { SheetStart } from './sheet-start.ts';

/** The display name and the Connector's own fields, as one grouped form. */
export interface FieldsGroup {
  readonly node: HTMLElement;
  /** Every input by the key of the draft value it holds: "name", then the Connector's field keys. */
  readonly inputs: ReadonlyMap<string, HTMLInputElement>;
}

/**
 * Returns the display name and the Connector's fields as one group, two to a line, each label above its field,
 * holding the values of `start`. Labels and placeholders of the Connector's fields are the Connector's own.
 * @example
 * fieldsGroup(posthog, { id: null, name: '', values: {}, interval: null }, 'fr').inputs.size; // 4
 */
export function fieldsGroup(connector: ConnectorView, start: SheetStart, lang: Language): FieldsGroup {
  const text = SETTINGS_TEXT[lang];
  const inputs = new Map<string, HTMLInputElement>();

  const cell = (
    key: string,
    label: string,
    value: string,
    attributes: Readonly<Record<string, string>>,
  ): HTMLElement => {
    const input = element('input', {
      className: 'field',
      attributes: { name: key, spellcheck: 'false', ...attributes },
    });

    input.value = value;
    inputs.set(key, input);

    return element('label', { className: 'form-cell' }, [
      element('span', { className: 'form-label', text: label }),
      input,
    ]);
  };

  const cells = [
    cell('name', text.sheetName, start.name, { placeholder: text.namePlaceholder, maxlength: String(MAX_NAME_LENGTH) }),
    ...connector.fields.map((field) =>
      cell(field.key, field.label[lang], start.values[field.key] ?? '', {
        placeholder: field.placeholder,
        type: field.kind === 'url' ? 'url' : 'text',
      }),
    ),
  ];

  return { node: element('div', { className: 'group form-group' }, cells), inputs };
}
