import { describe, expect, test } from 'vitest';
import { pickedValues } from '../src/picked-values.ts';

describe('the values of a field that holds several', () => {
  test('are read from the lists, each once, trimmed, and none empty', () => {
    const settings = { values: {}, lists: { projects: ['prj_web', ' prj_api ', '', 'prj_web'] } };

    expect(pickedValues(settings, 'projects')).toEqual(['prj_web', 'prj_api']);
  });

  test('are the one former value of a Source saved before the field held several', () => {
    expect(pickedValues({ values: { project: ' tramlo-web ' } }, 'projects', 'project')).toEqual(['tramlo-web']);
  });

  test('come from the list rather than the former value once both are there', () => {
    const settings = { values: { project: 'tramlo-web' }, lists: { projects: ['prj_api'] } };

    expect(pickedValues(settings, 'projects', 'project')).toEqual(['prj_api']);
  });

  test('are none for a Source that holds neither', () => {
    expect(pickedValues({ values: {} }, 'projects', 'project')).toEqual([]);
    expect(pickedValues({ values: { project: '  ' } }, 'projects', 'project')).toEqual([]);
  });
});
