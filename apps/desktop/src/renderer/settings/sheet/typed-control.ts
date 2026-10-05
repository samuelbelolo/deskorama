import { element } from '../element.ts';
import type { FieldControl } from './field-control.ts';

/** What a typed field is drawn with. */
export interface TypedControlOptions {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  /** Where to find the value, said under the field. */
  readonly hint?: string | undefined;
  /** The input's own attributes: its placeholder, its type, its longest value. */
  readonly attributes: Readonly<Record<string, string>>;
}

/**
 * Returns a field a person types, its label above it and, when there is one, where to find the value under it,
 * which describes the field without being part of its name.
 * @example
 * typedControl({ key: 'project', label: 'Project ID', value: '', hint: 'The number after /project/.',
 *   attributes: { placeholder: '12345', type: 'text' } }).value(); // ''
 */
export function typedControl(options: TypedControlOptions): FieldControl {
  const id = `sheet-field-${options.key}`;

  const hint =
    options.hint === undefined
      ? null
      : element('span', { className: 'form-hint', text: options.hint, attributes: { id: `${id}-hint` } });

  const input = element('input', {
    className: 'field',
    attributes: {
      id,
      name: options.key,
      spellcheck: 'false',
      ...(hint === null ? {} : { 'aria-describedby': `${id}-hint` }),
      ...options.attributes,
    },
  });

  input.value = options.value;

  const node = element('div', { className: 'form-cell' }, [
    element('label', { className: 'form-label', text: options.label, attributes: { for: id } }),
    input,
    hint,
  ]);

  return {
    node,
    value: () => input.value,
    mark: (invalid) => input.setAttribute('aria-invalid', String(invalid)),
  };
}
