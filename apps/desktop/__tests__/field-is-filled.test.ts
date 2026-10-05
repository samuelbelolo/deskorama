import type { ChoiceField, PickManyField, PickOneField } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { fieldIsFilled } from '../src/main/settings-window/field-is-filled.ts';

const CLOUD: ChoiceField = {
  key: 'host',
  kind: 'choice',
  label: { fr: 'Cloud', en: 'Cloud' },
  choices: [
    { value: 'https://us.kavelo.example', label: { fr: 'US', en: 'US' } },
    { value: 'https://eu.kavelo.example', label: { fr: 'EU', en: 'EU' } },
  ],
  other: { label: { fr: 'Auto-hébergé', en: 'Self-hosted' }, kind: 'url', placeholder: 'https://kavelo.example' },
};

const ORGANIZATION: PickOneField = {
  key: 'organization',
  kind: 'pick-one',
  needs: [],
  label: { fr: 'Organisation', en: 'Organization' },
  placeholder: 'tramlo',
};

const PROJECTS: PickManyField = {
  key: 'projects',
  kind: 'pick-many',
  needs: [],
  formerly: 'project',
  max: 2,
  label: { fr: 'Projets', en: 'Projects' },
  placeholder: 'tramlo-web',
  counted: { fr: { one: '1 projet', many: '{count} projets' }, en: { one: '1 project', many: '{count} projects' } },
};

describe('a field of a draft', () => {
  test('with fixed choices holds one of them, or a typed value of the kind the field allows', () => {
    expect(fieldIsFilled(CLOUD, { values: { host: 'https://eu.kavelo.example' } })).toBe(true);
    expect(fieldIsFilled(CLOUD, { values: { host: 'https://analytics.tramlo.example' } })).toBe(true);
    expect(fieldIsFilled(CLOUD, { values: { host: 'http://analytics.tramlo.example' } })).toBe(false);
    expect(fieldIsFilled(CLOUD, { values: {} })).toBe(false);
  });

  test('with fixed choices and nothing to type holds one of them only', () => {
    const { other: _, ...fixed } = CLOUD;

    expect(fieldIsFilled(fixed, { values: { host: 'https://analytics.tramlo.example' } })).toBe(false);
  });

  test('with fixed choices holds the one an address names with a slash at its end', () => {
    const { other: _, ...fixed } = CLOUD;

    expect(fieldIsFilled(fixed, { values: { host: ' https://eu.kavelo.example/ ' } })).toBe(true);
  });

  test('picked among loaded options holds a value', () => {
    expect(fieldIsFilled(ORGANIZATION, { values: { organization: 'tramlo' } })).toBe(true);
    expect(fieldIsFilled(ORGANIZATION, { values: { organization: '  ' } })).toBe(false);
  });

  test('that holds several needs one at least, and no more than its limit', () => {
    expect(fieldIsFilled(PROJECTS, { values: {}, lists: { projects: ['prj_web', 'prj_api'] } })).toBe(true);
    expect(fieldIsFilled(PROJECTS, { values: {}, lists: { projects: [] } })).toBe(false);
    expect(fieldIsFilled(PROJECTS, { values: {}, lists: { projects: ['a', 'b', 'c'] } })).toBe(false);
  });

  test('that holds several takes a hundred at most when its Connector sets no limit', () => {
    const { max: _, ...unbounded } = PROJECTS;
    const ids = Array.from({ length: 101 }, (_unused, index) => `prj_${index}`);

    expect(fieldIsFilled(unbounded, { values: {}, lists: { projects: ids.slice(0, 100) } })).toBe(true);
    expect(fieldIsFilled(unbounded, { values: {}, lists: { projects: ids } })).toBe(false);
  });

  test('that holds several is filled by the one value a Source saved before it kept', () => {
    expect(fieldIsFilled(PROJECTS, { values: { project: 'tramlo-web' } })).toBe(true);
  });

  test('that holds several may hold none when none stands for all', () => {
    const all = { ...PROJECTS, none: { fr: 'Tous les projets', en: 'All projects' } };

    expect(fieldIsFilled(all, { values: {} })).toBe(true);
  });
});
