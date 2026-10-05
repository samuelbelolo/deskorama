import { tidyValues, type Language, type PickManyField, type PickOneField } from '@deskorama/core';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/** What a field typed for want of a list is drawn from, and whom it tells. */
export interface PickByHandOptions {
  readonly field: PickOneField | PickManyField;
  /** The values the field holds when it is drawn. */
  readonly picked: readonly string[];
  readonly lang: Language;
  /** Called with the values typed, each time they change. */
  readonly onChange: (picked: string[]) => void;
}

/**
 * Returns the field a person types in when the options cannot be loaded, with where to find the value in the
 * Connector's own words; a field that holds several takes them separated by commas, and says so.
 * @example
 * pickByHand({ field: projects, picked: ['tramlo-web'], lang: 'en', onChange });
 * // a field holding "tramlo-web", "Separate several with commas."
 */
export function pickByHand(options: PickByHandOptions): HTMLElement {
  const { field, lang } = options;
  const several = field.kind === 'pick-many';

  const input = element('input', {
    className: 'field',
    attributes: {
      name: field.key,
      type: 'text',
      spellcheck: 'false',
      placeholder: field.placeholder,
      'aria-label': field.label[lang],
    },
  });

  input.value = options.picked.join(', ');

  input.addEventListener('input', () => {
    const typed = several ? input.value.split(',') : [input.value];

    options.onChange(tidyValues(typed));
  });

  const notes = [field.hint?.[lang], several ? SETTINGS_TEXT[lang].pickSeveral : undefined].filter(
    (note) => note !== undefined,
  );

  return element('div', { className: 'pick-hand' }, [
    input,
    notes.length === 0 ? null : element('span', { className: 'form-hint', text: notes.join(' ') }),
  ]);
}
