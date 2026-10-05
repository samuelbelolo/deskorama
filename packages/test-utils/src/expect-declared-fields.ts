import { LANGUAGES, type ChoiceField, type Connector, type PickManyField } from '@deskorama/core';
import { expect } from 'vitest';
import { isLoadedField } from './is-loaded-field.ts';

/**
 * Checks what a Connector declares of its fields: each has its own key and a label in every language, a hint says
 * something in every language, a choice offers at least two values a person can tell apart, and a field picked
 * among loaded options needs fields declared before it that hold one value, comes with a `listOptions`, and says how
 * many it holds.
 * @example
 * expectDeclaredFields(createPostHog()); // fails when a choice has no French label
 */
export function expectDeclaredFields(connector: Connector): void {
  const { fields } = connector.config;

  const keys = fields.map((field) => field.key);

  expect(new Set(keys).size).toBe(keys.length);

  for (const [index, field] of fields.entries()) {
    for (const lang of LANGUAGES) {
      expect(field.label[lang]).not.toBe('');

      if (field.hint !== undefined) expect(field.hint[lang]).not.toBe('');
    }

    if (field.kind === 'choice') expectChoices(field);

    if (isLoadedField(field)) {
      // A needed value is read where a field keeps one: a field that holds several can never be seen filled.
      const single = fields
        .slice(0, index)
        .filter((earlier) => earlier.kind !== 'pick-many')
        .map((earlier) => earlier.key);

      expect(connector.listOptions !== undefined).toBe(true);
      expect(single).toEqual(expect.arrayContaining([...field.needs]));
    }

    if (field.kind === 'pick-many') expectCounted(field);
  }
}

/**
 * Checks the choices of a field: at least two, each with its own value and a name in every language, and the choice
 * typed by hand, if any, named too.
 * @example
 * expectChoices({ kind: 'choice', key: 'host', label, choices: [us, eu], other: selfHosted });
 */
function expectChoices(field: ChoiceField): void {
  const values = field.choices.map((choice) => choice.value);

  expect(values.length).toBeGreaterThanOrEqual(2);
  expect(new Set(values).size).toBe(values.length);

  for (const lang of LANGUAGES) {
    for (const choice of field.choices) expect(choice.label[lang]).not.toBe('');

    if (field.other !== undefined) expect(field.other.label[lang]).not.toBe('');
  }
}

/**
 * Checks how a field that holds several says how many: one, several with the number's place, and what none means
 * when none may be picked.
 * @example
 * expectCounted({ kind: 'pick-many', key: 'projects', counted: { en: { one: '1 project', many: '{count} projects' }, … }, … });
 */
function expectCounted(field: PickManyField): void {
  for (const lang of LANGUAGES) {
    expect(field.counted[lang].one).not.toBe('');
    expect(field.counted[lang].many).toContain('{count}');

    if (field.none !== undefined) expect(field.none[lang]).not.toBe('');
  }

  if (field.max !== undefined) expect(field.max).toBeGreaterThan(0);
}
