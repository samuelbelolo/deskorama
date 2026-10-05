import { LANGUAGES, type Connector, type SourceSettings } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { createFakeFetch, type Responder } from './create-fake-fetch.ts';
import { describeListedOptions, type ListedOptionsCase } from './describe-listed-options.ts';
import { describeReportedEvents } from './describe-reported-events.ts';
import { describeReportedFailures } from './describe-reported-failures.ts';
import { describeReportedGauges } from './describe-reported-gauges.ts';
import { expectDeclaredFields } from './expect-declared-fields.ts';
import { isLoadedField } from './is-loaded-field.ts';

/** What the shared suite needs to drive one Connector. */
export interface ConnectorContractCase {
  readonly connector: Connector;
  /** Settings of a fictional Source, with `.example` addresses and a made-up token. */
  readonly settings: SourceSettings;
  /**
   * What a first poll brings: Events, the default, or Gauge values only, for a service whose terms forbid
   * streaming its events.
   */
  readonly reports?: 'events' | 'gauges';
  /**
   * Returns a fresh responder that answers every request of a first poll from recorded responses, with at least
   * one Event, or one Gauge value when the Connector reports Gauges only. Called once per poll, so a responder that
   * plays recordings in order starts over each time.
   */
  readonly recorded: () => Responder;
  /** One recorded loading for each field the Connector picks among loaded options. */
  readonly options?: readonly ListedOptionsCase[];
  /** The time of the polls. */
  readonly now: number;
}

/**
 * Registers the tests every Connector passes: the Events of a recorded poll are complete in every language and keep
 * their ids when the page is replayed, and the cursor is something to resume from, or, for a Connector that reports
 * Gauges only, its counts are sound and it never returns an Event; each failure a service can answer becomes
 * the `ConnectorError` the platform acts on, never anything else; and every field picked among loaded options
 * loads them from a recorded answer, and fails the same way.
 * @example
 * describeConnectorContract({ connector: createFeed(), settings, recorded: () => inOrder([page]), now: FIXTURE_TIME });
 */
export function describeConnectorContract(contract: ConnectorContractCase): void {
  const { connector, settings, now } = contract;

  const poll = (respond: Responder) =>
    connector.poll({ settings, cursor: null, fetch: createFakeFetch(respond).fetch, now });

  describe(`the ${connector.id} Connector contract`, () => {
    test('declares its fields, permissions, interval bounds and Gauge words in every language', () => {
      const { interval, permissions } = connector.config;

      expect(interval.min).toBeGreaterThan(0);
      expect(interval.min).toBeLessThanOrEqual(interval.default);
      expect(interval.default).toBeLessThanOrEqual(interval.max);
      expect(permissions.length).toBeGreaterThan(0);

      for (const lang of LANGUAGES) {
        expect(connector.title[lang]).not.toBe('');

        for (const permission of permissions) expect(permission.why[lang]).not.toBe('');

        for (const gauge of Object.values(connector.gauges)) {
          expect(gauge.text[lang].label).not.toBe('');
          expect(gauge.text[lang].short).not.toBe('');
        }
      }

      expectDeclaredFields(connector);
    });

    test('has a recorded loading for every field picked among loaded options', () => {
      const loaded = connector.config.fields.filter(isLoadedField);

      expect((contract.options ?? []).map((listed) => listed.field).toSorted()).toEqual(
        loaded.map((field) => field.key).toSorted(),
      );
    });

    const firstPoll = () => poll(contract.recorded());

    if (contract.reports === 'gauges') describeReportedGauges(firstPoll);
    else describeReportedEvents(firstPoll);

    describeReportedFailures({
      what: 'a poll',
      call: poll,
      permissions: connector.config.permissions.map((permission) => permission.name),
      now,
    });

    for (const listed of contract.options ?? []) describeListedOptions(connector, settings, now, listed);
  });
}
