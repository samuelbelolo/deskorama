import { element } from './element.ts';

/** One choice of a select. */
export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** Shown greyed out, e.g. a Theme the app does not ship yet. */
  readonly disabled?: boolean;
}

/** A select with its label. */
export interface LabelledSelect {
  readonly field: HTMLSelectElement;
  /** The label then the select, ready to append. */
  readonly nodes: readonly HTMLElement[];
}

/**
 * Returns a select of `options` with `selected` chosen, labelled `label`.
 * @example
 * const theme = labelledSelect('theme', 'Theme', [{ value: 'aeroport', label: 'L’Aéroport' }], 'aeroport');
 * theme.field.value; // "aeroport"
 * panel.append(...theme.nodes);
 */
export function labelledSelect(
  key: string,
  label: string,
  options: readonly SelectOption[],
  selected: string,
): LabelledSelect {
  const field = element(
    'select',
    { attributes: { id: `field-${key}`, name: key } },
    options.map((option) => {
      const node = element('option', { text: option.label, attributes: { value: option.value } });

      node.disabled = option.disabled === true;

      return node;
    }),
  );

  field.value = selected;

  return { field, nodes: [element('label', { text: label, attributes: { for: `field-${key}` } }), field] };
}
