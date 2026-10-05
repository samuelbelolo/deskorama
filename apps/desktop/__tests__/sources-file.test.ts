import { describe, expect, test } from 'vitest';
import { readSources } from '../src/main/sources/read-sources.ts';
import { withSources } from '../src/main/sources/with-sources.ts';

const TRAMLO = { id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: 'https://api.tramlo.example/events' } };

describe('the Sources in settings.json', () => {
  test('are read back as written, next to the other settings, with no token', () => {
    const text = withSources('{"localWebhook":{"port":5000}}', [TRAMLO]);

    expect(JSON.parse(text)).toEqual({ localWebhook: { port: 5000 }, sources: [TRAMLO] });
    expect(readSources(text)).toEqual([TRAMLO]);
  });

  test('skip an entry that does not parse and keep the others', () => {
    expect(readSources(JSON.stringify({ sources: [{ id: 'broken' }, TRAMLO] }))).toEqual([TRAMLO]);
  });

  test('keep a chosen interval, and keep a Source whose interval is not a number on its Connector’s default', () => {
    const sources = [
      { ...TRAMLO, interval: 120_000 },
      { ...TRAMLO, id: 'src-2', interval: '60' },
    ];

    expect(readSources(JSON.stringify({ sources }))).toEqual([
      { ...TRAMLO, interval: 120_000 },
      { ...TRAMLO, id: 'src-2' },
    ]);
  });

  test('keep the values of a field that holds several, and read a Source saved without any', () => {
    const several = {
      ...TRAMLO,
      id: 'src-2',
      connector: 'vercel',
      values: {},
      lists: { projects: ['prj_web', 'prj_api'] },
    };

    const text = withSources(null, [TRAMLO, several]);

    expect(readSources(text)).toEqual([TRAMLO, several]);
  });

  test('are none when the file is missing or unreadable', () => {
    expect(readSources(null)).toEqual([]);
    expect(readSources('not json')).toEqual([]);
    expect(withSources('not json', [])).toBe('{\n  "sources": []\n}\n');
  });
});
