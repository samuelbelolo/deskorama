import type { PollResult } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createStripe } from '../src/create-stripe.ts';
import { KAVELO_STRIPE, recordedStripe } from './kavelo-stripe.ts';

/** The no-break space French puts between an amount and its currency. */
const NBSP = ' ';

/** A monthly billing period, as Stripe writes it on a price. */
const MONTH = { interval: 'month', interval_count: 1 };

/** A price of €49 a month. */
const MONTHLY_EUR = { unit_amount: 4900, currency: 'eur', recurring: MONTH };

/**
 * Polls Kavelo's Stripe account once from `cursor`, through a fake `fetch` answering `recording`, and returns the
 * result with the request sent.
 * @example
 * const { result, sent } = await pollOnce(recordedStripe('events-page.json'));
 * // result.cursor: 'evt_1KvKaveloSubRenew01', sent[0].url: 'https://api.stripe.com/v1/events?…&limit=5'
 */
async function pollOnce(
  recording: RecordedResponse,
  cursor: string | null = null,
): Promise<{ result: PollResult; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder([recording]));

  const result = await createStripe().poll({ settings: KAVELO_STRIPE, cursor, fetch: fake.fetch, now: FIXTURE_TIME });

  return { result, sent: fake.sent };
}

/**
 * Returns the query parameters of a request sent to Stripe, each with all its values.
 * @example
 * queryOf(sent[0]); // { 'types[]': ['payment_intent.succeeded', …], limit: ['5'] }
 */
function queryOf(request: SentRequest | undefined): Record<string, string[]> {
  const params = new URL(request?.url ?? 'https://api.stripe.com').searchParams;

  return Object.fromEntries([...new Set(params.keys())].map((key) => [key, params.getAll(key)]));
}

describe('the Stripe Connector', () => {
  test('reads the latest few events of the types it maps, with the restricted key, then those after the newest', async () => {
    const first = await pollOnce(recordedStripe('events-page.json'));
    const next = await pollOnce(recordedStripe('empty-page.json'), first.result.cursor);

    expect(first.sent[0]?.url.startsWith('https://api.stripe.com/v1/events?')).toBe(true);
    expect(first.sent[0]?.init).toMatchObject({
      method: 'GET',
      headers: { Authorization: 'Bearer rk_live_kavelo-restricted-key-for-tests' },
    });
    expect(queryOf(first.sent[0])).toEqual({
      'types[]': [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'customer.subscription.created',
        'customer.subscription.updated',
      ],
      limit: ['5'],
    });
    expect(first.result.cursor).toBe('evt_1KvKaveloSubRenew01');
    expect(queryOf(next.sent[0])).toMatchObject({ limit: ['100'], ending_before: ['evt_1KvKaveloSubRenew01'] });
  });

  test('turns payments and new subscriptions into Events, oldest first, in both languages', async () => {
    const { result } = await pollOnce(recordedStripe('events-page.json'));

    const base = { recognised: true, source: 'Kavelo' };

    expect(result.events).toEqual([
      {
        ...base,
        id: 'evt_1KvKaveloPaid0001',
        kind: 'payment_intent.succeeded',
        archetype: 'money',
        rarity: 'common',
        at: new Date(1_791_120_290_000),
        gauge: { role: 'daily', by: 1 },
        text: {
          fr: { label: 'Paiement reçu', detail: `Encaissement de 49${NBSP}€`, tag: `+49${NBSP}€` },
          en: { label: 'Payment received', detail: '€49 collected', tag: '+€49' },
        },
      },
      {
        ...base,
        id: 'evt_1KvKaveloSubNew001',
        kind: 'customer.subscription.created',
        archetype: 'money',
        rarity: 'notable',
        at: new Date(1_791_120_300_000),
        gauge: { role: 'total', by: 1 },
        text: {
          fr: { label: 'Nouvel abonnement', detail: `49${NBSP}€ par mois`, tag: `+49${NBSP}€` },
          en: { label: 'New subscription', detail: '€49 a month', tag: '+€49' },
        },
      },
      {
        ...base,
        id: 'evt_1KvKaveloDeclined01',
        kind: 'payment_intent.payment_failed',
        archetype: 'rejection',
        rarity: 'common',
        at: new Date(1_791_120_900_000),
        text: {
          fr: { label: 'Paiement refusé', detail: `Provision insuffisante, 129${NBSP}€`, tag: 'REFUSÉ' },
          en: { label: 'Payment declined', detail: 'Insufficient funds, €129', tag: 'DECLINED' },
        },
      },
      {
        ...base,
        id: 'evt_1KvKaveloTrial001',
        kind: 'customer.subscription.created',
        archetype: 'arrival',
        rarity: 'common',
        at: new Date(1_791_121_500_000),
        text: {
          fr: { label: 'Nouvel abonnement', detail: `Essai gratuit, puis 19${NBSP}€ par mois`, tag: 'ESSAI' },
          en: { label: 'New subscription', detail: 'Free trial, then €19 a month', tag: 'TRIAL' },
        },
      },
    ]);
  });

  test('plays a subscription once its first payment goes through, and a trial converted, but not one still incomplete', async () => {
    const { result } = await pollOnce(recordedStripe('updates-page.json'), 'evt_1KvKaveloSubRenew01');

    expect(result.events.map((event) => [event.id, event.text.en])).toEqual([
      ['evt_1KvKaveloStarted01', { label: 'New subscription', detail: '€129 a month', tag: '+€129' }],
      ['evt_1KvKaveloConvert01', { label: 'Trial converted to paid', detail: '€190 a year', tag: '+€190' }],
    ]);
    expect(result.cursor).toBe('evt_1KvKaveloConvert01');
  });

  test('reads the next page at once while more events wait after the cursor', async () => {
    const page = recordedStripe('events-page.json');
    const more = { ...page, body: { ...v.parse(v.record(v.string(), v.unknown()), page.body), has_more: true } };

    const resumed = await pollOnce(more, 'evt_1KvKaveloOlder0001');
    const first = await pollOnce(more);

    expect(resumed.result.delay).toBe(0);
    expect(first.result.delay).toBeUndefined();
  });

  test('keeps the cursor when nothing happened, and stays at none before the first event', async () => {
    expect((await pollOnce(recordedStripe('empty-page.json'), 'evt_1KvKaveloSubRenew01')).result).toEqual({
      events: [],
      cursor: 'evt_1KvKaveloSubRenew01',
    });
    expect((await pollOnce(recordedStripe('empty-page.json'))).result).toEqual({ events: [], cursor: null });
  });

  test.each([400, 404])('starts over at once when Stripe no longer knows the cursor’s event (%i)', async (status) => {
    const { result } = await pollOnce(recordedStripe('unknown-cursor.json', status), 'evt_1KvKaveloGone0001');

    expect(result).toEqual({ events: [], cursor: null, delay: 0 });
  });

  test('counts a three-decimal currency in thousandths', async () => {
    const intent = { amount: 5120, amount_received: 5120, currency: 'kwd' };
    const paid = { id: 'evt_1KvKaveloKwd0001', type: 'payment_intent.succeeded', created: 1_791_121_000 };
    const page = { object: 'list', has_more: false, data: [{ ...paid, data: { object: intent } }] };

    const { result } = await pollOnce({ status: 200, body: page });

    expect(result.events[0]?.text.en.detail).toBe(`KWD${NBSP}5.120 collected`);
  });

  test.each([
    ['bills by usage', [{ quantity: 1, price: { ...MONTHLY_EUR, recurring: { ...MONTH, usage_type: 'metered' } } }]],
    ['bills in groups of units', [{ quantity: 6, price: { ...MONTHLY_EUR, transform_quantity: { divide_by: 5 } } }]],
    [
      'mixes billing periods, a free one first',
      [
        { quantity: 1, price: { ...MONTHLY_EUR, unit_amount: 0 } },
        { quantity: 1, price: { ...MONTHLY_EUR, recurring: { interval: 'year', interval_count: 1 } } },
      ],
    ],
  ])('plays a new subscription that %s as paid, without a price it cannot know', async (_, items) => {
    const created = { id: 'evt_1KvKaveloMixed001', type: 'customer.subscription.created', created: 1_791_121_000 };
    const subscription = { status: 'active', items: { data: items } };
    const page = { object: 'list', has_more: false, data: [{ ...created, data: { object: subscription } }] };

    const { result } = await pollOnce({ status: 200, body: page });

    expect(result.events).toMatchObject([
      { archetype: 'money', gauge: { role: 'total', by: 1 }, text: { en: { detail: 'Paid subscription' } } },
    ]);
  });

  test('plays a subscription on a free plan as an arrival, with no money and no new subscriber', async () => {
    const free = { unit_amount: 0, currency: 'EUR', recurring: { interval: 'month', interval_count: 1 } };
    const subscription = { status: 'active', items: { data: [{ quantity: 1, price: free }] } };

    const created = { id: 'evt_1KvKaveloFree0001', type: 'customer.subscription.created', created: 1_791_121_000 };
    const page = { object: 'list', has_more: false, data: [{ ...created, data: { object: subscription } }] };

    const { result } = await pollOnce({ status: 200, body: page });

    expect(result.events).toMatchObject([
      { archetype: 'arrival', text: { en: { label: 'New subscription', detail: 'Free plan', tag: 'FREE' } } },
    ]);
    expect(result.events[0]?.gauge).toBeUndefined();
  });

  test('reports a payment whose object changed shape as an unexpected response', async () => {
    const page = { object: 'list', has_more: false, data: [] as unknown[] };
    const broken = { id: 'evt_1KvKaveloBroken01', type: 'payment_intent.succeeded', created: 1_791_120_000 };

    page.data.push({ ...broken, data: { object: { amount: '49.00', currency: 'eur' } } });

    await expect(pollOnce({ status: 200, body: page })).rejects.toMatchObject({
      failure: { kind: 'invalid-response' },
    });
  });

  test('polls every 5 minutes by default, and never more often than once a minute', () => {
    expect(createStripe().config.interval).toEqual({ min: 60_000, default: 300_000, max: 900_000 });
  });
});
