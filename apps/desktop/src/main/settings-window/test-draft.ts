import type { Connector, ConnectorFetch, Language } from '@deskorama/core';
import type { SourceDraft, TestAnswer } from '../../shared/settings-bridge.ts';
import { failureOf } from '../sources/failure-of.ts';

/** How many of the latest Events a test shows. */
const SHOWN_EVENTS = 5;

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
 * language, newest first, or the failure the person must fix.
 * @example
 * await testDraft(draft, { connector: createFeed(), token, fetch, now, lang: 'en' });
 * // { ok: true, events: [{ label: 'Deploy succeeded', detail: 'v2.5.0 in production', at: 1791122400000 }] }
 */
export async function testDraft(draft: SourceDraft, test: DraftTest): Promise<TestAnswer> {
  const settings = { name: draft.name.trim(), values: draft.values, token: test.token };

  try {
    const result = await test.connector.poll({ settings, cursor: null, fetch: test.fetch, now: test.now });

    const latest = result.events.slice(-SHOWN_EVENTS).toReversed();

    const events = latest.map((event) => {
      const { label, detail } = event.text[test.lang];

      return { label, detail, at: event.at.getTime() };
    });

    return { ok: true, events };
  } catch (error) {
    return { ok: false, problems: [], status: { state: 'failing', failure: failureOf(error), at: test.now } };
  }
}
