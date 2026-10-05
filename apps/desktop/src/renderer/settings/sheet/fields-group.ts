import type { Language } from '@deskorama/core';
import { MAX_NAME_LENGTH } from '../../../shared/max-name-length.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { choiceControl } from './choice-control.ts';
import type { FieldControl } from './field-control.ts';
import type { SheetStart } from './sheet-start.ts';
import { typedControl } from './typed-control.ts';

/** The display name and the Connector's fields that need no token, as one grouped form. */
export interface FieldsGroup {
  readonly node: HTMLElement;
  /** The display name. */
  readonly name: FieldControl;
  /** The Connector's fields that need no token, each by its key. */
  readonly controls: ReadonlyMap<string, FieldControl>;
}

/**
 * Returns the display name and the Connector's typed and fixed-choice fields as one group, two to a line, each
 * label above its field, holding the values of `start`. Labels, choices, hints and placeholders of the Connector's
 * fields are the Connector's own. The fields picked from what the token can see are not here: they come after it.
 * @example
 * fieldsGroup(posthog, { id: null, name: '', values: {}, interval: null }, 'fr').controls.size; // 2
 */
export function fieldsGroup(connector: ConnectorView, start: SheetStart, lang: Language): FieldsGroup {
  const text = SETTINGS_TEXT[lang];

  const name = typedControl({
    key: 'name',
    label: text.sheetName,
    value: start.name,
    attributes: { placeholder: text.namePlaceholder, maxlength: String(MAX_NAME_LENGTH) },
  });

  const controls = new Map<string, FieldControl>();

  for (const field of connector.fields) {
    const value = start.values[field.key] ?? '';

    if (field.kind === 'choice') controls.set(field.key, choiceControl(field, value, lang));

    if (field.kind === 'url' || field.kind === 'text') {
      const attributes = { placeholder: field.placeholder, type: field.kind === 'url' ? 'url' : 'text' };

      controls.set(
        field.key,
        typedControl({ key: field.key, label: field.label[lang], value, hint: field.hint?.[lang], attributes }),
      );
    }
  }

  const cells = [name, ...controls.values()].map((control) => control.node);

  return { node: element('div', { className: 'group form-group' }, cells), name, controls };
}
