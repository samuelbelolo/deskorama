import { GAUGE_ROLES, type Connector, type ConnectorFetch, type GaugeRole, type Language } from '@deskorama/core';
import type { SourceDraft, TestAnswer } from '../../shared/source-draft.ts';
import { failureOf } from '../sources/failure-of.ts';
import { seenEvent } from './seen-event.ts';

/** How many of the latest Events a test shows. */
const SHOWN_EVENTS = 3;

/** What a test poll needs besides the draft. */
export interface DraftTest {
  readonly connector: Connector;
  readonly token: string;
  readonly fetch: ConnectorFetch;
  readonly now: number;
  readonly lang: Language;
}

/**
 * Polls a draft once from no cursor, without saving anything, and returns its latest Events in the display
 * language, newest first, each with its Role, and the Gauge values it read, or the failure the person must fix.
 * @example
 * await testDraft(draft, { connector: createFeed(), token, fetch, now, lang: 'en' });
 * // { ok: true, events: [{ label: 'Deploy succeeded', detail: 'v2.5.0', at: 1791122400000, archetype: 'deploy' }], gauges: {} }
 */
export async function testDraft(draft: SourceDraft, test: DraftTest): Promise<TestAnswer> {
  const settings = { name: draft.name.trim(), values: draft.values, token: test.token };

  try {
    const result = await test.connector.poll({ settings, cursor: null, fetch: test.fetch, now: test.now });

    const events = result.events
      .slice(-SHOWN_EVENTS)
      .toReversed()
      .map((event) => seenEvent(event, test.lang));

    const gauges: Partial<Record<GaugeRole, number>> = {};

    for (const role of GAUGE_ROLES) {
      const value = result.gauges?.[role];

      if (value !== undefined) gauges[role] = value;
    }

    return { ok: true, events, gauges };
  } catch (error) {
    return { ok: false, problems: [], status: { state: 'failing', failure: failureOf(error), at: test.now } };
  }
}
