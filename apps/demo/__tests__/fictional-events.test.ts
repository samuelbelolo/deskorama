import { LANGUAGES } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { fictionalEventAt } from '../src/fictional-event-at.ts';
import { FICTIONAL_EVENTS } from '../src/fictional-events.ts';

const SENT_AT = Date.UTC(2026, 9, 4, 14);

describe('the fictional Events of the demo', () => {
  test('have a fact and a detail in every display language', () => {
    for (const event of FICTIONAL_EVENTS) {
      for (const lang of LANGUAGES) {
        expect(event.text[lang].label, `${event.kind} ${lang}`).not.toBe('');
        expect(event.text[lang].detail, `${event.kind} ${lang}`).not.toBe('');
      }
    }
  });

  test('never carry an e-mail address or a web address', () => {
    const words = FICTIONAL_EVENTS.flatMap((event) =>
      LANGUAGES.map((lang) => Object.values(event.text[lang]).join(' ')),
    );
    expect(words.filter((line) => /@|https?:\/\//.test(line))).toEqual([]);
  });

  test('cover a Role, a foreign Source and a kind nobody described', () => {
    expect(FICTIONAL_EVENTS.some((event) => event.archetype !== null)).toBe(true);
    expect(FICTIONAL_EVENTS.some((event) => event.archetype === null && event.recognised)).toBe(true);
    expect(FICTIONAL_EVENTS.some((event) => !event.recognised)).toBe(true);
  });

  test('are sent in turn, each with its own id and the time it is sent', () => {
    const sent = Array.from({ length: FICTIONAL_EVENTS.length + 1 }, (_, count) => fictionalEventAt(count, SENT_AT));
    expect(new Set(sent.map((event) => event.id)).size).toBe(sent.length);
    expect(sent.at(-1)?.kind).toBe(FICTIONAL_EVENTS[0]?.kind);
    expect(sent[0]?.at.getTime()).toBe(SENT_AT);
  });
});
