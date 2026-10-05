import type { ChoiceField, Language } from '@deskorama/core';
import { choiceOf } from '../../../shared/choice-of.ts';
import { element } from '../element.ts';
import type { FieldControl } from './field-control.ts';

/** The value of the pop-up's last line, which lets the person type one: no real choice is empty. */
const OTHER = '';

/**
 * Returns a field with a few fixed choices, as a pop-up button under its label, holding `start`. When the field
 * lets the person type a value, that is its last line: choosing it shows a field to type in, which a value none of
 * the choices holds opens with. A new Source starts on the first choice.
 * @example
 * choiceControl(cloud, 'https://eu.posthog.com/', 'en').value(); // 'https://eu.posthog.com'
 * choiceControl(cloud, 'https://posthog.kavelo.example', 'en').value(); // the typed address, under "Self-hosted"
 */
export function choiceControl(field: ChoiceField, start: string, lang: Language): FieldControl {
  const { other } = field;

  const known = choiceOf(field, start)?.value;
  const first = field.choices[0]?.value ?? OTHER;
  const startsTyped = other !== undefined && start.trim() !== '' && known === undefined;

  const lines = [
    ...field.choices.map((choice) => ({ value: choice.value, label: choice.label[lang] })),
    ...(other === undefined ? [] : [{ value: OTHER, label: other.label[lang] }]),
  ];

  const id = `sheet-field-${field.key}`;

  const select = element(
    'select',
    { attributes: { id, name: field.key } },
    lines.map((line) => element('option', { text: line.label, attributes: { value: line.value } })),
  );

  select.value = startsTyped ? OTHER : (known ?? first);

  const typed = element('input', {
    className: 'field',
    attributes: {
      name: `${field.key}-other`,
      spellcheck: 'false',
      type: other?.kind === 'url' ? 'url' : 'text',
      placeholder: other?.placeholder ?? '',
      'aria-label': other?.label[lang] ?? '',
    },
  });

  typed.value = startsTyped ? start : '';

  const show = (): void => {
    typed.hidden = other === undefined || select.value !== OTHER;
  };

  select.addEventListener('input', show);
  show();

  const node = element('div', { className: 'form-cell' }, [
    element('label', { className: 'form-label', text: field.label[lang], attributes: { for: id } }),
    element('span', { className: 'popup wide' }, [select]),
    other === undefined ? null : typed,
  ]);

  return {
    node,
    value: () => (select.value === OTHER && other !== undefined ? typed.value : select.value),

    mark(invalid) {
      select.setAttribute('aria-invalid', String(invalid && typed.hidden));
      typed.setAttribute('aria-invalid', String(invalid && !typed.hidden));
    },
  };
}
