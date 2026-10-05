import type { ConnectorOption, Language, PickOneField } from '@deskorama/core';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/** What a pop-up of loaded options is drawn from, and whom it tells. */
export interface PickSelectOptions {
  readonly field: PickOneField;
  /** The options the service listed. */
  readonly listed: readonly ConnectorOption[];
  /** The value chosen when the pop-up is drawn, or empty for none yet. */
  readonly picked: string;
  readonly lang: Language;
  /** Called with the value chosen, each time it changes. */
  readonly onChange: (picked: string) => void;
}

/**
 * Returns the options of a field that holds one value as a pop-up button. Nothing chosen yet shows an invitation
 * to choose as its first line; a value chosen before that the service no longer lists stays, under its own name.
 * @example
 * pickSelect({ field: organization, listed: [tramlo, kavelo], picked: '', lang: 'en', onChange });
 * // "Choose…", "Kavelo Labs", "Tramlo"
 */
export function pickSelect(options: PickSelectOptions): HTMLElement {
  const { field, picked, lang } = options;

  const isListed = options.listed.some((option) => option.value === picked);

  const lines = [
    ...(picked === '' ? [{ value: '', label: SETTINGS_TEXT[lang].pickChoose }] : []),
    ...(picked === '' || isListed ? [] : [{ value: picked, label: picked }]),
    ...options.listed,
  ];

  const select = element(
    'select',
    { attributes: { name: field.key, 'aria-label': field.label[lang] } },
    lines.map((line) => element('option', { text: line.label, attributes: { value: line.value } })),
  );

  select.value = picked;
  // On input rather than change, which comes after it: the sheet reads the choice as soon as the input is heard.
  select.addEventListener('input', () => options.onChange(select.value));

  return element('span', { className: 'popup wide' }, [select]);
}
