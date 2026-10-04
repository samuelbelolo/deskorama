import { createRandom, type GaugeValues, type SourceEvent } from '@deskorama/core';
import { describe, expect, test } from 'vitest';
import { createSimulator } from '../src/simulate/create-simulator.ts';
import { DEMO_SOURCES } from '../src/sources/demo-sources.ts';
import { BAILIX } from '../src/sources/bailix.ts';
import { KAVELO } from '../src/sources/kavelo.ts';
import { TRAMLO } from '../src/sources/tramlo.ts';
import { TRAMLO_KIT } from '../src/sources/tramlo-kit.ts';
import { triggersOf } from '../src/triggers-of.ts';
import { createManualClock } from './manual-clock.ts';

const AFTERNOON = new Date(2026, 9, 4, 14).getTime();
const NIGHT = new Date(2026, 9, 4, 3).getTime();
const MINUTE = 60_000;

/**
 * Runs a fictional Source on a hand-moved Clock and records what it sends to the engine.
 * @example
 * const run = simulate(TRAMLO, AFTERNOON, 60);
 * run.clock.advance(MINUTE);
 * run.sent.length; // the Events of an hour of activity
 */
function simulate(source = TRAMLO, start = AFTERNOON, speed = 60, seed = 5) {
  const clock = createManualClock(start);
  const sent: SourceEvent[] = [];
  const gauges: Partial<GaugeValues>[] = [];

  const engine = {
    send: (event: SourceEvent) => sent.push(event),
    setGauges: (values: Partial<GaugeValues>) => gauges.push(values),
  };
  const simulator = createSimulator(engine, source, { clock, random: createRandom(seed), speed });

  return { clock, sent, gauges, simulator };
}

describe('a fictional Source at work', () => {
  test('reports its Gauges at once, as a first poll would at that hour', () => {
    const { gauges } = simulate();

    expect(gauges[0]?.total).toBe(TRAMLO.gauges.totalStart);
    expect(gauges[0]?.daily).toBeGreaterThan(0);
  });

  test('sends its own kinds at its rates, busier at work than at night, each Event once', () => {
    const day = simulate(TRAMLO, AFTERNOON);
    const night = simulate(TRAMLO, NIGHT);
    day.clock.advance(10 * MINUTE);
    night.clock.advance(10 * MINUTE);

    expect(day.sent.length).toBeGreaterThan(night.sent.length * 3);
    expect(new Set(day.sent.map((event) => event.id)).size).toBe(day.sent.length);
    expect(day.sent.every((event) => event.source === 'Tramlo')).toBe(true);
  });

  test('goes faster when sped up', () => {
    const slow = simulate(TRAMLO, AFTERNOON, 1);
    const fast = simulate(TRAMLO, AFTERNOON, 60);
    slow.clock.advance(10 * MINUTE);
    fast.clock.advance(10 * MINUTE);

    expect(fast.sent.length).toBeGreaterThan(slow.sent.length * 10);

    slow.simulator.setSpeed(60);
    const before = slow.sent.length;
    slow.clock.advance(10 * MINUTE);
    expect(slow.sent.length - before).toBeGreaterThan(before);
  });

  test('plays the same day for the same seed', () => {
    const first = simulate();
    const second = simulate();
    first.clock.advance(5 * MINUTE);
    second.clock.advance(5 * MINUTE);

    expect(first.sent).toEqual(second.sent);
  });

  test('sends a triggered kind at once, and its Gauge move shows in the Gauges it reports next', () => {
    const { clock, sent, gauges, simulator } = simulate(TRAMLO, NIGHT, 1);
    const before = gauges.at(-1)?.daily ?? 0;

    simulator.trigger('push.main');
    clock.advance(1000);

    const push = sent.at(-1);
    expect(push?.kind).toBe('push.main');
    expect(push?.archetype).toBe('usage');
    expect(gauges.at(-1)?.daily).toBe(before + (push?.gauge?.by ?? 0));
  });

  test('counts its daily Gauge from its own Events when they move it, never twice', () => {
    const { clock, sent, gauges } = simulate(KAVELO, AFTERNOON, 60, 7);
    const before = gauges.at(-1)?.daily ?? 0;
    clock.advance(10 * MINUTE);

    const moved = sent.reduce((sum, event) => sum + (event.gauge?.role === 'daily' ? event.gauge.by : 0), 0);
    expect(moved).toBeGreaterThan(0);
    expect(gauges.at(-1)?.daily).toBe(before + moved);
  });

  test('starts its daily Gauge again at midnight', () => {
    const { clock, gauges } = simulate(TRAMLO_KIT, new Date(2026, 9, 4, 23, 59, 50).getTime(), 1);
    expect(gauges.at(-1)?.daily).toBeGreaterThan(300);

    clock.advance(20_000);
    expect(gauges.at(-1)?.daily).toBe(0);
  });

  test('never catches up on hours of activity after its timers were held back, as in a hidden tab', () => {
    const clock = createManualClock(AFTERNOON);
    const held = { ...clock, after: (_ms: number, task: () => void) => clock.after(MINUTE, task) };
    const sent: SourceEvent[] = [];
    createSimulator({ send: (event) => sent.push(event), setGauges: () => {} }, BAILIX, {
      clock: held,
      random: createRandom(5),
      speed: 60,
    });

    clock.advance(MINUTE);

    // Three seconds of real time at ×60 is three minutes of Bailix's afternoon: a handful of Events, not an hour's.
    expect(sent.length).toBeLessThan(5);
  });

  test('lets a deploy sent by hand take over the one building, so the visitor always sees its outcome', () => {
    const { clock, sent, simulator } = simulate(TRAMLO, NIGHT, 1);

    simulator.trigger('deploy.succeeded');
    clock.advance(1000);
    simulator.trigger('deploy.failed');
    clock.advance(8000);

    expect(sent.map((event) => event.step)).toEqual(['started', 'failed']);
  });

  test('runs a whole deploy when one is triggered: it starts, then fails a few seconds later', () => {
    const { clock, sent, simulator } = simulate(TRAMLO, NIGHT, 1);

    simulator.trigger('deploy.failed');
    expect(sent.map((event) => event.step)).toEqual(['started']);

    clock.advance(8000);
    const failed = sent.at(-1);
    expect(failed?.step).toBe('failed');
    expect(failed?.rarity).toBe('jackpot');
    expect(failed?.text.en.label).toBe('Deploy failed');
  });

  test('sends an Event from another Source and one of a kind nobody described', () => {
    const { sent, simulator } = simulate(TRAMLO, NIGHT, 1);

    simulator.trigger('mail.received');
    simulator.trigger('discussion.created');

    expect(sent.map(({ source, archetype, recognised }) => ({ source, archetype, recognised }))).toEqual([
      { source: 'Mail', archetype: null, recognised: true },
      { source: 'Tramlo', archetype: null, recognised: false },
    ]);
  });

  test.each(DEMO_SOURCES)('lets the visitor send every Event $profile.name offers by hand', (source) => {
    const { clock, sent, simulator } = simulate(source, NIGHT, 1);

    for (const trigger of triggersOf(source)) {
      const before = sent.length;
      simulator.trigger(trigger.kind);
      clock.advance(8000);

      expect({ kind: trigger.kind, sent: sent.length > before }).toEqual({ kind: trigger.kind, sent: true });
    }
  });

  test('stops sending once stopped', () => {
    const { clock, sent, simulator } = simulate();

    simulator.trigger('deploy.succeeded');
    simulator.stop();
    clock.advance(30 * MINUTE);

    expect(sent).toHaveLength(1);
  });
});
