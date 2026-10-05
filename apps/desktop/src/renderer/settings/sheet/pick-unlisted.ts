import type { Language, PickManyField, PickOneField } from '@deskorama/core';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/** What the line under a loaded list is drawn from, and whom it tells. */
export interface PickUnlistedOptions {
  readonly field: PickOneField | PickManyField;
  readonly lang: Language;
  /**
   * Called with the value typed, trimmed and never empty, once the person confirms it; `again` is true when they
   * did so with the Return key, and may type another.
   */
  readonly onAdd: (value: string, again: boolean) => void;
}

/**
 * Returns the line under a loaded list where a person types a value the list lacks, since a service lists only so
 * many, with where to find the value in the Connector's own words. The Return key, or leaving the line, hands the
 * value over; what is typed before that changes nothing a Source keeps, so the sheet is not told.
 * @example
 * pickUnlisted({ field: signupEvents, lang: 'en', onAdd });
 * // typing "user_signed_up", then Return, calls onAdd('user_signed_up', true)
 */
export function pickUnlisted(options: PickUnlistedOptions): HTMLElement {
  const { field, lang } = options;
  const text = SETTINGS_TEXT[lang];

  const input = element('input', {
    className: 'field',
    attributes: {
      name: `${field.key}-unlisted`,
      type: 'text',
      spellcheck: 'false',
      placeholder: text.pickUnlistedPlaceholder,
      'aria-label': text.pickUnlisted(field.label[lang]),
    },
  });

  const add = (again: boolean): void => {
    const typed = input.value.trim();

    if (typed !== '') options.onAdd(typed, again);
  };

  input.addEventListener('input', (event) => event.stopPropagation());
  input.addEventListener('change', () => add(false));

  input.addEventListener('keydown', (event) => {
    // The Return key that ends a composition confirms its characters, not the value.
    if (event.key !== 'Enter' || event.isComposing) return;

    event.preventDefault();
    add(true);
  });

  const hint = field.hint?.[lang];

  return element('div', { className: 'pick-unlisted' }, [
    input,
    hint === undefined ? null : element('span', { className: 'form-hint', text: hint }),
  ]);
}
