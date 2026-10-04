import { describe, expect, test } from 'vitest';
import { toSourceEvent } from '../src/to-source-event.ts';
import { validatePostedEvent } from '../src/validate-posted-event.ts';

const RECEIVED_AT = Date.UTC(2026, 9, 4, 14);

/**
 * Returns a posted Event whose English words carry `tag`.
 * @example
 * withTag('🚀 DEPLOY SUCCESS').text.en.tag; // "🚀 DEPLOY SUCCESS"
 */
function withTag(tag: string) {
  return { kind: 'deploy', source: 'Tramlo', text: { en: { label: 'Deployed', tag } } };
}

describe('an Event in its JSON form', () => {
  test('needs only a kind, a Source and the words in one language, and fills in the rest', async () => {
    const validation = await validatePostedEvent({
      kind: 'signup.created',
      source: 'Tramlo',
      text: { en: { label: 'New sign-up' } },
    });

    expect(validation).toEqual({
      ok: true,
      event: {
        kind: 'signup.created',
        archetype: null,
        recognised: true,
        rarity: 'common',
        source: 'Tramlo',
        text: { en: { label: 'New sign-up', detail: '', tag: '' } },
      },
    });
  });

  test('uses words given in one language for both, and the receiving time and id when they are left out', async () => {
    const validation = await validatePostedEvent({
      kind: 'signup.created',
      archetype: 'arrival',
      source: 'Tramlo',
      text: { fr: { label: 'Nouvelle inscription', detail: 'Formule Pro', tag: 'PRO' } },
    });

    if (!validation.ok) throw new Error(validation.issues.join('\n'));

    const event = toSourceEvent(validation.event, RECEIVED_AT, 'generated-1');

    expect(event).toMatchObject({ id: 'generated-1', archetype: 'arrival', at: new Date(RECEIVED_AT) });
    expect(event.text.en).toEqual(event.text.fr);
  });

  test('refuses an unknown field and a Role nobody defined, naming each problem', async () => {
    const validation = await validatePostedEvent({
      kind: 'signup.created',
      archetype: 'party',
      source: 'Tramlo',
      colour: 'red',
      text: { en: { label: 'New sign-up' } },
    });

    expect(validation.ok).toBe(false);
    expect(validation.ok ? [] : validation.issues.map((issue) => issue.split(':')[0])).toEqual(['archetype', 'colour']);
  });

  test('refuses a time Date.parse cannot read, such as an offset without its colon', async () => {
    const base = { kind: 'signup.created', source: 'Tramlo', text: { en: { label: 'New sign-up' } } };

    expect((await validatePostedEvent({ ...base, at: '2026-10-04T13:52:10+02:00' })).ok).toBe(true);
    expect((await validatePostedEvent({ ...base, at: '2026-10-04T13:52:10+02' })).ok).toBe(false);
    expect((await validatePostedEvent({ ...base, at: '2026-10-04 13:52:10Z' })).ok).toBe(false);
  });

  test('refuses a day its month lacks, which Date.parse would carry into the next month', async () => {
    const base = { kind: 'signup.created', source: 'Tramlo', text: { en: { label: 'New sign-up' } } };

    expect((await validatePostedEvent({ ...base, at: '2026-02-31T10:00:00Z' })).ok).toBe(false);
    expect((await validatePostedEvent({ ...base, at: '2026-04-31T10:00:00Z' })).ok).toBe(false);
    expect((await validatePostedEvent({ ...base, at: '2026-02-29T10:00:00Z' })).ok).toBe(false);
    expect((await validatePostedEvent({ ...base, at: '2028-02-29T10:00:00Z' })).ok).toBe(true);
    expect((await validatePostedEvent({ ...base, at: '2100-02-29T10:00:00Z' })).ok).toBe(false);
    expect((await validatePostedEvent({ ...base, at: '2000-02-29T10:00:00Z' })).ok).toBe(true);
  });

  test('counts lengths in characters, before trimming, as the published JSON Schema does', async () => {
    expect((await validatePostedEvent(withTag('🚀 DEPLOY SUCCESS'))).ok).toBe(true);
    expect((await validatePostedEvent(withTag(' 🚀 DEPLOY SUCCESS'))).ok).toBe(false);
  });
});
