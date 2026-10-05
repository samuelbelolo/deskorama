import type { SourceEvent } from '@deskorama/core';
import { createFakeClock, FIXTURE_TIME, sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createSourceRuntime, type SourceState } from '../src/main/sources/create-source-runtime.ts';
import type { SourceEntry } from '../src/main/sources/source-entry.ts';
import { memoryStores } from './memory-stores.ts';
import { scriptedConnector, type Script } from './scripted-connector.ts';
import { settle } from './settle.ts';

const TRAMLO: SourceEntry = { id: 'src-1', connector: 'scripted', name: 'Tramlo', values: {} };
const MINUTE = 60_000;

/**
 * Starts a runtime with one Source answered by `scripts`, and returns what a test watches: the Events played, the
 * states reported, the polls' inputs, the stores and the Clock.
 * @example
 * const run = await startRuntime([{ events: [merged], cursor: 'c1' }]);
 */
async function startRuntime(scripts: readonly Script[], tokens: Record<string, string> = { 'src-1': 'token-1' }) {
  const clock = createFakeClock(FIXTURE_TIME);
  const stores = memoryStores(tokens);
  const { connector, inputs } = scriptedConnector(scripts);
  const played: SourceEvent[] = [];
  const from: string[] = [];
  const states: (readonly SourceState[])[] = [];

  const runtime = createSourceRuntime({
    connectors: [connector],
    clock,
    fetch: async () => {
      throw new Error('a scripted Connector never fetches');
    },
    ...stores,
    onEvent: (event, sourceId) => {
      played.push(event);
      from.push(sourceId);
    },
    onGauges: () => {},
    onStates: (next) => states.push(next),
  });

  runtime.load([TRAMLO]);
  await settle();

  const step = async (ms: number): Promise<void> => {
    clock.advance(ms);
    await settle();
  };

  return { runtime, played, from, states, inputs, stores, step, lastStatus: () => states.at(-1)?.[0]?.status };
}

describe('the connected Sources', () => {
  test('poll at once with the token from the Keychain, then resume from the saved cursor a minute later', async () => {
    const run = await startRuntime([
      { events: [sourceEventFixture({ id: 'a' })], cursor: 'c1' },
      { events: [], cursor: 'c2' },
    ]);

    expect(run.inputs[0]).toMatchObject({ cursor: null, settings: { name: 'Tramlo', token: 'token-1' } });

    await run.step(MINUTE);

    expect(run.inputs.map((input) => input.cursor)).toEqual([null, 'c1']);
    expect(run.stores.cursors.map.get('src-1')).toBe('c2');
    expect(run.played.map((event) => event.id)).toEqual(['1:a']);
  });

  test('play an Event once even when the Source returns it again', async () => {
    const page = { events: [sourceEventFixture({ id: 'a' }), sourceEventFixture({ id: 'b' })], cursor: 'c1' };
    const run = await startRuntime([page, { ...page, events: [...page.events, sourceEventFixture({ id: 'c' })] }]);

    await run.step(MINUTE);

    expect(run.played.map((event) => event.id)).toEqual(['1:a', '1:b', '1:c']);
  });

  test('poll again at once while the Source has more, then wait its hint within the bounds', async () => {
    const run = await startRuntime([
      { events: [], cursor: 'c1', delay: 0 },
      { events: [], cursor: 'c2', delay: 5_000 },
      { events: [], cursor: 'c3' },
    ]);

    await run.step(0);
    expect(run.inputs).toHaveLength(2);

    await run.step(29_999);
    expect(run.inputs).toHaveLength(2);

    await run.step(1);
    expect(run.inputs).toHaveLength(3);
  });

  test('stop on a refused token and report it, until the Source is loaded again', async () => {
    const run = await startRuntime([{ kind: 'auth' }]);

    expect(run.lastStatus()).toEqual({ state: 'failing', failure: { kind: 'auth' }, at: FIXTURE_TIME });

    await run.step(60 * MINUTE);
    run.runtime.pollAll();
    await settle();

    expect(run.inputs).toHaveLength(1);
  });

  test('report a Source without a token as a refused token, without polling', async () => {
    const run = await startRuntime([], {});

    expect(run.inputs).toHaveLength(0);
    expect(run.lastStatus()).toMatchObject({ state: 'failing', failure: { kind: 'auth' } });
  });

  test('wait for the reset a rate limit announces', async () => {
    const run = await startRuntime([{ kind: 'rate-limit', resetAt: FIXTURE_TIME + 10 * MINUTE }]);

    await run.step(10 * MINUTE - 1);
    expect(run.inputs).toHaveLength(1);

    await run.step(1);
    expect(run.inputs).toHaveLength(2);
  });

  test('back off further apart after each network failure, then recover', async () => {
    const run = await startRuntime([{ kind: 'network' }, { kind: 'network' }, { events: [], cursor: 'c1' }]);

    await run.step(MINUTE);
    expect(run.inputs).toHaveLength(2);

    await run.step(MINUTE);
    expect(run.inputs).toHaveLength(2);

    await run.step(MINUTE);
    expect(run.inputs).toHaveLength(3);
    expect(run.lastStatus()).toEqual({ state: 'ok', at: FIXTURE_TIME + 3 * MINUTE });
  });

  test('catch up at once when the Mac wakes, from the saved cursor', async () => {
    const run = await startRuntime([
      { events: [], cursor: 'c1' },
      { events: [sourceEventFixture({ id: 'night' })], cursor: 'c2' },
    ]);

    run.runtime.pollAll();
    await settle();

    expect(run.inputs.map((input) => input.cursor)).toEqual([null, 'c1']);
    expect(run.played.map((event) => event.id)).toEqual(['1:night']);
  });

  test('stop polling a removed Source', async () => {
    const run = await startRuntime([]);

    run.runtime.load([]);
    await run.step(10 * MINUTE);

    expect(run.inputs).toHaveLength(1);
    expect(run.runtime.states()).toEqual([]);
  });

  test('wait for a rate limit to reset even when the Mac wakes or another Source is saved', async () => {
    const run = await startRuntime([{ kind: 'rate-limit', resetAt: FIXTURE_TIME + 10 * MINUTE }]);

    run.runtime.pollAll();
    run.runtime.load([TRAMLO, { ...TRAMLO, id: 'src-2', name: 'Other' }]);
    await settle();

    expect(run.inputs.filter((input) => input.settings.name === 'Tramlo')).toHaveLength(1);
    expect(run.runtime.states()[0]?.status).toMatchObject({ state: 'failing', failure: { kind: 'rate-limit' } });
  });

  test('play an id again once the Source points at another address, as another Event', async () => {
    const page = { events: [sourceEventFixture({ id: 'a' })], cursor: 'c1' };
    const run = await startRuntime([page, page]);

    run.runtime.load([{ ...TRAMLO, values: { url: 'https://other.tramlo.example/events' } }]);
    await settle();

    expect(run.played.map((event) => event.id)).toEqual(['1:a', '2:a']);
  });

  test('tell apart two Sources named alike that give two Events the same id', async () => {
    const page = { events: [sourceEventFixture({ id: 'pr-12-merged' })], cursor: 'c1' };
    const run = await startRuntime([page, page], { 'src-1': 'token-1', 'src-2': 'token-2' });

    run.runtime.load([TRAMLO, { ...TRAMLO, id: 'src-2' }]);
    await settle();

    expect(run.played.map((event) => event.id)).toEqual(['1:pr-12-merged', '2:pr-12-merged']);
    expect(run.from).toEqual(['src-1', 'src-2']);
  });

  test('hand the Events on even when the cursor cannot be saved', async () => {
    const run = await startRuntime([]);
    const failing = {
      ...run.stores.cursors,
      write: (): never => {
        throw new Error('disk full');
      },
    };
    const { connector } = scriptedConnector([{ events: [sourceEventFixture({ id: 'kept' })], cursor: 'c1' }]);
    const played: SourceEvent[] = [];

    createSourceRuntime({
      connectors: [connector],
      clock: createFakeClock(FIXTURE_TIME),
      fetch: async () => {
        throw new Error('a scripted Connector never fetches');
      },
      tokens: run.stores.tokens,
      cursors: failing,
      onEvent: (event) => played.push(event),
      onGauges: () => {},
      onStates: () => {},
    }).load([TRAMLO]);
    await settle();

    expect(played.map((event) => event.id)).toEqual(['1:kept']);
  });

  test('never replay an Event after the person renames the Source or changes its interval', async () => {
    const replayed = { events: [sourceEventFixture({ id: 'a' })], cursor: 'c1' };
    const run = await startRuntime([replayed, replayed]);

    run.runtime.load([{ ...TRAMLO, name: 'Tramlo prod', interval: 2 * MINUTE }]);
    await run.step(0);

    expect(run.inputs).toHaveLength(2);
    expect(run.played.map((event) => event.id)).toEqual(['1:a']);
    expect(run.from).toEqual(['src-1']);
  });
});

describe('the last Event of each Source', () => {
  test('is the newest one it sent, kept while its address stays, and never a replay', async () => {
    const run = await startRuntime([
      { events: [sourceEventFixture({ id: 'a' }), sourceEventFixture({ id: 'b' })], cursor: 'c1' },
      { events: [sourceEventFixture({ id: 'a' })], cursor: 'c1' },
    ]);

    expect(run.states.at(-1)?.[0]?.last?.id).toBe('b');

    await run.step(MINUTE);

    expect(run.states.at(-1)?.[0]?.last?.id).toBe('b');

    run.runtime.load([{ ...TRAMLO, name: 'Tramlo prod' }]);

    expect(run.runtime.states()[0]?.last?.id).toBe('b');

    run.runtime.load([{ ...TRAMLO, values: { repository: 'tramlo/tramlo-kit' } }]);

    expect(run.runtime.states()[0]?.last).toBeNull();
  });

  test('is none until the Source sends one', async () => {
    const run = await startRuntime([{ events: [], cursor: 'c1' }]);

    expect(run.states.at(-1)?.[0]).toMatchObject({ status: { state: 'ok' }, last: null });
  });
});
