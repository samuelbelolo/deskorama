import type { Cancel, Clock, Engine, GaugeValues, Random, SourceEvent } from '@deskorama/core';
import type { DemoSource } from '../sources/demo-source.ts';
import { createBursts } from './create-bursts.ts';
import { createDeploys } from './create-deploys.ts';
import { deployEvent } from './deploy-event.ts';
import { dueKinds } from './due-kinds.ts';
import { eventOf } from './event-of.ts';
import { foreignEvents } from './foreign-events.ts';
import type { GaugeState } from './gauge-state.ts';
import { hourOf } from './hour-of.ts';
import { moveGauges } from './move-gauges.ts';
import { seedGauges } from './seed-gauges.ts';
import type { Stamp } from './stamp.ts';
import { stepGauges } from './step-gauges.ts';

/** How often, in real time, the simulator moves on. */
const STEP_MS = 1000;

/**
 * The longest real gap one step covers. A hidden tab's timers are throttled to a minute or more; without this cap,
 * the step after would send an hour of Events at once.
 */
const MAX_GAP_MS = 3 * STEP_MS;

/** A fictional Source at work: its Events, its Gauges and its deploys, sent to an engine. */
export interface Simulator {
  /** Sends one Event of this kind now: a kind of the Source, `deploy.succeeded` or `deploy.failed`, or a foreign kind. */
  trigger(kind: string): void;
  /** How many minutes of activity pass in one real minute: 1 is real time. */
  setSpeed(speed: number): void;
  readonly stop: Cancel;
}

/**
 * Plays a fictional Source in place of a Connector: at its invented rates, shaped by the hour of the Clock and sped up
 * by `speed`, it sends its Events to the engine, moves its Gauges and ships deploys. The Gauges start as a first poll
 * would find them at that hour, and the daily one starts again at midnight. Everything it draws comes from `random`.
 * @example
 * const simulator = createSimulator(engine, TRAMLO, { clock: host.clock, random: createRandom(7), speed: 10 });
 * simulator.trigger('pull_request.merged'); // the Theme plays the approval Gag
 * simulator.stop();
 */
export function createSimulator(
  engine: Pick<Engine, 'send' | 'setGauges'>,
  source: DemoSource,
  options: { readonly clock: Clock; readonly random: Random; readonly speed: number },
): Simulator {
  const { clock, random } = options;
  const name = source.profile.name;

  let speed = options.speed;
  let count = 0;
  let last = clock.now();
  let day = new Date(last).toDateString();
  let gauges = seedGauges(source, hourOf(last));

  const stamp = (): Stamp => {
    count += 1;
    return { id: `${source.id}-${count}`, at: new Date(clock.now()) };
  };

  // The engine applies an Event's Gauge move itself; the simulator follows, so its next report agrees.
  const send = (event: SourceEvent): void => {
    engine.send(event);
    if (event.gauge !== undefined) gauges = moveGauges(gauges, event.gauge);
  };

  const emit = (kind: string): void => {
    const known = source.kinds.find((each) => each.kind === kind);
    if (known !== undefined) send(eventOf(name, known, random, stamp()));
  };

  const bursts = createBursts({ clock, random, speed: () => speed, emit });
  const deploys = createDeploys(source.deploys, {
    clock,
    random,
    speed: () => speed,
    report: (step, apps) => send(deployEvent(name, step, apps, stamp())),
  });

  let timer: Cancel = clock.after(STEP_MS, function step() {
    const now = clock.now();
    const minutes = (Math.min(now - last, MAX_GAP_MS) / 60_000) * speed;
    const hour = hourOf(now);
    last = now;

    const today = new Date(now).toDateString();
    if (today !== day) gauges = { ...gauges, daily: 0 };
    day = today;

    for (const kind of dueKinds(source, random, { hour, minutes })) {
      emit(kind.kind);
      if (kind.bursty === true) bursts.after(kind.kind);
    }

    gauges = stepGauges(source, gauges, { hour, minutes, random });
    publish(engine, gauges);
    deploys.step(hour, minutes);
    timer = clock.after(STEP_MS, step);
  });

  publish(engine, gauges);

  return {
    trigger(kind) {
      const foreign = foreignEvents(name).find((each) => each.kind === kind);

      if (kind === 'deploy.succeeded' || kind === 'deploy.failed')
        deploys.send(kind === 'deploy.failed' ? 'failed' : 'succeeded');
      else if (foreign !== undefined) send({ ...foreign, ...stamp() });
      else emit(kind);
    },
    setSpeed(next) {
      speed = next;
    },
    stop() {
      timer();
      bursts.stop();
      deploys.stop();
    },
  };
}

/**
 * Hands the engine the simulated Gauges, rounded as a Connector would report them.
 * @example
 * publish(engine, { crowd: 4.4, daily: 25.6, total: 37 }); // engine.setGauges({ crowd: 4, daily: 26, total: 37 })
 */
function publish(engine: Pick<Engine, 'setGauges'>, state: GaugeState): void {
  const values: Partial<GaugeValues> = {
    crowd: Math.round(state.crowd),
    daily: Math.round(state.daily),
    total: Math.round(state.total),
  };

  engine.setGauges(values);
}
