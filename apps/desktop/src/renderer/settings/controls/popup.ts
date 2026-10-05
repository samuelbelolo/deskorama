import { element } from '../element.ts';

/** One choice of a pop-up button. */
export interface PopupOption<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

/**
 * Returns a pop-up button drawn after the macOS one, built on a real select so the keyboard and VoiceOver work as
 * they do everywhere: `onChoose` receives the value of the option picked.
 * @example
 * popup('Language', [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }], 'fr', setLanguage);
 */
export function popup<Value extends string>(
  label: string,
  options: readonly PopupOption<Value>[],
  selected: Value,
  onChoose: (value: Value) => void,
): HTMLElement {
  const select = element(
    'select',
    { attributes: { 'aria-label': label } },
    options.map((option) => element('option', { text: option.label, attributes: { value: option.value } })),
  );

  select.value = selected;

  select.addEventListener('change', () => {
    // Read from the options rather than from the select, whose value is any string.
    const chosen = options[select.selectedIndex];

    if (chosen !== undefined) onChoose(chosen.value);
  });

  return element('span', { className: 'popup' }, [select]);
}
