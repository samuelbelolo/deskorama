import { ARCHETYPES, createRandom, LANGUAGES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { DEMO_SOURCES } from '../src/sources/demo-sources.ts';

/** How many times each kind is drawn, so every branch of its invented words shows up. */
const DRAWS = 40;

describe('the fictional Sources', () => {
  test('are the four the visitor picks from: a private repository first, a public one, a SaaS, a consumer app', () => {
    expect(DEMO_SOURCES.map((source) => source.profile.name)).toEqual(['Tramlo', 'Tramlo Kit', 'Kavelo', 'Bailix']);
    expect(new Set(DEMO_SOURCES.map((source) => source.id)).size).toBe(DEMO_SOURCES.length);
  });

  test.each(DEMO_SOURCES)('$profile.name names itself and its Gauges in every language', (source) => {
    for (const lang of LANGUAGES) {
      expect(source.title[lang]).not.toBe('');
      expect(source.pitch[lang]).not.toBe('');

      for (const role of ['crowd', 'daily', 'total'] as const) {
        const { label, short } = source.profile.gauges[role].text[lang];
        expect(label).not.toBe('');
        expect(short).not.toBe('');
      }
    }

    expect(source.hourly).toHaveLength(24);
    expect(source.gauges.crowdMedian).toBeLessThanOrEqual(source.profile.gauges.crowd.max);
  });

  test.each(DEMO_SOURCES)('$profile.name sends each of its kinds under one Role, at an invented rate', (source) => {
    expect(new Set(source.kinds.map((kind) => kind.kind)).size).toBe(source.kinds.length);

    for (const kind of source.kinds) {
      expect(ARCHETYPES).toContain(kind.archetype);
      expect(kind.perDay).toBeGreaterThan(0);
    }
  });

  test.each(DEMO_SOURCES)('$profile.name draws a fact, a detail and a short tag in every language', (source) => {
    const random = createRandom(7);

    for (const kind of source.kinds) {
      for (let draw = 0; draw < DRAWS; draw += 1) {
        const { text } = kind.draw(random);

        for (const lang of LANGUAGES) {
          const { detail, tag } = text[lang];

          // The Feed format caps a tag at 16 characters; a Theme paints it on a prop.
          expect({
            kind: kind.kind,
            lang,
            label: kind.label[lang] !== '',
            detail: detail !== '',
            tag: tag.length <= 16,
          }).toEqual({
            kind: kind.kind,
            lang,
            label: true,
            detail: true,
            tag: true,
          });
        }
      }
    }
  });

  test.each(DEMO_SOURCES)('$profile.name never shows an e-mail address or a web address', (source) => {
    const random = createRandom(11);
    const words = source.kinds.flatMap((kind) =>
      Array.from({ length: DRAWS }, () => kind.draw(random)).flatMap(({ text }) =>
        LANGUAGES.flatMap((lang) => [kind.label[lang], text[lang].detail, text[lang].tag]),
      ),
    );

    expect(words.filter((line) => /@|https?:\/\/|www\./.test(line))).toEqual([]);
  });

  test.each(DEMO_SOURCES)('$profile.name only draws from its seeded generator', (source) => {
    const draws = (seed: number): unknown[] => {
      const random = createRandom(seed);
      return source.kinds.map((kind) => kind.draw(random));
    };

    expect(draws(3)).toEqual(draws(3));
  });
});
