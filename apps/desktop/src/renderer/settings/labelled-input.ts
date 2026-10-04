import { element } from './element.ts';

/** An input with its label, and the key of the draft value it holds. */
export interface LabelledInput {
  readonly key: string;
  readonly field: HTMLInputElement;
  /** The label then the input, ready to append. */
  readonly nodes: readonly HTMLElement[];
}

/**
 * Returns an input holding `value`, labelled `label`, for the draft value `key`.
 * @example
 * const name = labelledInput('name', 'Display name', 'Tramlo', { maxlength: '40' });
 * form.append(...name.nodes);
 */
export function labelledInput(
  key: string,
  label: string,
  value: string,
  attributes: Readonly<Record<string, string>>,
): LabelledInput {
  const field = element('input', { attributes: { id: `field-${key}`, name: key, ...attributes } });

  field.value = value;

  return { key, field, nodes: [element('label', { text: label, attributes: { for: `field-${key}` } }), field] };
}
