import type { ChoiceField, FieldChoice } from '@deskorama/core';

/**
 * Returns the choice of a field that a value names, or undefined when it names none: the choice whose value is the
 * trimmed value, a slash at its end aside, since an address typed with one is still the cloud it names.
 * @example
 * choiceOf(cloud, 'https://eu.posthog.com/')?.label.en; // 'EU Cloud'
 * choiceOf(cloud, 'https://posthog.kavelo.example'); // undefined
 */
export function choiceOf(field: ChoiceField, value: string): FieldChoice | undefined {
  const named = value.trim().replace(/\/+$/u, '');

  return field.choices.find((choice) => choice.value === named);
}
