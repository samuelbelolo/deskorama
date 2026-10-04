import { ConnectorError, LANGUAGES, type Connector, type ConnectorFailure, type SourceSettings } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { createFakeFetch, type Responder } from './create-fake-fetch.ts';

/** What the shared suite needs to drive one Connector. */
export interface ConnectorContractCase {
  readonly connector: Connector;
  /** Settings of a fictional Source, with `.example` addresses and a made-up token. */
  readonly settings: SourceSettings;
  /**
   * Returns a fresh responder that answers every request of a first poll from recorded responses, with at least
   * one Event. Called once per poll, so a responder that plays recordings in order starts over each time.
   */
  readonly recorded: () => Responder;
  /** The time of the polls. */
  readonly now: number;
}

/** The longest tag a Theme can paint on a prop. */
const MAX_TAG_LENGTH = 16;

/**
 * Registers the tests every Connector passes: the Events of a recorded poll are complete in every language and keep
 * their ids when the page is replayed, the cursor is something to resume from, and each failure a service can
 * answer becomes the {@link ConnectorError} the platform acts on, never anything else.
 * @example
 * describeConnectorContract({ connector: createFeed(), settings, recorded: () => inOrder([page]), now: FIXTURE_TIME });
 */
export function describeConnectorContract(contract: ConnectorContractCase): void {
  const { connector, settings, now } = contract;

  const poll = (respond: Responder) =>
    connector.poll({ settings, cursor: null, fetch: createFakeFetch(respond).fetch, now });

  /**
   * Returns the failure a first poll answered by `respond` reports, null when it succeeds, and fails the test when
   * the Connector throws anything but a ConnectorError.
   * @example
   * await failureOf(() => ({ status: 401 })); // { kind: 'auth' }
   */
  const failureOf = async (respond: Responder): Promise<ConnectorFailure | null> => {
    const error: unknown = await poll(respond).then(
      () => null,
      (reason: unknown) => reason,
    );

    if (error === null) return null;

    if (!(error instanceof ConnectorError))
      throw new Error('poll threw something else than a ConnectorError', { cause: error });

    return error.failure;
  };

  describe(`the ${connector.id} Connector contract`, () => {
    test('declares its fields, permissions, interval bounds and Gauge words in every language', () => {
      const { interval, fields, permissions } = connector.config;

      expect(interval.min).toBeGreaterThan(0);
      expect(interval.min).toBeLessThanOrEqual(interval.default);
      expect(interval.default).toBeLessThanOrEqual(interval.max);
      expect(permissions.length).toBeGreaterThan(0);

      for (const lang of LANGUAGES) {
        expect(connector.title[lang]).not.toBe('');

        for (const field of fields) expect(field.label[lang]).not.toBe('');

        for (const permission of permissions) expect(permission.why[lang]).not.toBe('');

        for (const gauge of Object.values(connector.gauges)) {
          expect(gauge.text[lang].label).not.toBe('');
          expect(gauge.text[lang].short).not.toBe('');
        }
      }
    });

    test('returns Events with unique ids, a time and their words in every language', async () => {
      const result = await poll(contract.recorded());

      expect(result.events.length).toBeGreaterThan(0);
      expect(new Set(result.events.map((event) => event.id)).size).toBe(result.events.length);
      expect(typeof result.cursor).toBe('string');

      for (const event of result.events) {
        expect(Number.isFinite(event.at.getTime())).toBe(true);
        expect(event.source).not.toBe('');

        for (const lang of LANGUAGES) {
          expect(event.text[lang].label).not.toBe('');
          expect(event.text[lang].tag.length).toBeLessThanOrEqual(MAX_TAG_LENGTH);
        }
      }
    });

    test('keeps the ids of a replayed page, so the platform drops the replay', async () => {
      const first = await poll(contract.recorded());
      const replay = await poll(contract.recorded());

      expect(replay.events.map((event) => event.id)).toEqual(first.events.map((event) => event.id));
    });

    test('reports a refused token, naming nothing else', async () => {
      expect(await failureOf(() => ({ status: 401, body: { message: 'Bad credentials' } }))).toEqual({ kind: 'auth' });
    });

    test('names the missing permission, among those it asks for', async () => {
      const failure = await failureOf(() => ({ status: 403, body: { message: 'Forbidden' } }));
      const names = connector.config.permissions.map((permission) => permission.name);

      expect(failure?.kind).toBe('permission');
      expect(names).toContain(failure?.kind === 'permission' ? failure.permission : undefined);
    });

    test('waits for the reset a rate limit announces', async () => {
      expect(await failureOf(() => ({ status: 429, headers: { 'Retry-After': '120' } }))).toEqual({
        kind: 'rate-limit',
        resetAt: now + 120_000,
      });
    });

    test('reports a server error or no answer at all as a network failure', async () => {
      expect(await failureOf(() => ({ status: 503, body: 'Service Unavailable' }))).toEqual({ kind: 'network' });

      expect(
        await failureOf(() => {
          throw new TypeError('fetch failed');
        }),
      ).toEqual({ kind: 'network' });
    });

    test('reports an answer it cannot read as an unexpected response', async () => {
      expect(await failureOf(() => ({ status: 200, body: '<html>Login</html>' }))).toEqual({
        kind: 'invalid-response',
      });
    });
  });
}
