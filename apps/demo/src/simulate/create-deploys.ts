import type { Cancel, Clock, DeployStep, Random } from '@deskorama/core';
import type { DemoDeploys } from '../sources/demo-source.ts';

/** The shortest real wait between a deploy's start and its outcome, the time the scene needs to show the build. */
const MIN_REAL_BUILD_MS = 8000;

/** How often the front end ships rather than the back end. */
const FRONT_SHARE = 0.6;

/** A fictional Source's deploy waves: the front end or the back end ships, then succeeds or, rarely, fails. */
export interface Deploys {
  /**
   * Ends a deploy with this outcome after the shortest build, as the visitor asked: the wave building takes it,
   * or a new wave starts.
   */
  send(outcome: 'succeeded' | 'failed'): void;
  /** Maybe starts a wave, at the Source's rate and odds, during its working hours. */
  step(hour: number, minutes: number): void;
  readonly stop: Cancel;
}

/** A wave between its start and its outcome. */
interface Wave {
  readonly apps: readonly string[];
  readonly cancel: Cancel;
}

/**
 * Returns the deploy waves of a fictional Source. A wave reports its start, then its outcome once built: a few minutes
 * of activity shortened by the speed, never under eight real seconds; a wave the visitor sends builds in those eight.
 * @example
 * const deploys = createDeploys(TRAMLO.deploys, { clock, random, speed: () => 10, report });
 * deploys.send('failed'); // report('started', ['web', 'docs', 'admin']), then report('failed', ...) eight seconds later
 */
export function createDeploys(
  deploys: DemoDeploys,
  options: {
    readonly clock: Clock;
    readonly random: Random;
    readonly speed: () => number;
    readonly report: (step: DeployStep, apps: readonly string[]) => void;
  },
): Deploys {
  const { clock, random, speed, report } = options;
  let building: Wave | null = null;

  const build = (apps: readonly string[], fail: boolean, wait: number): void => {
    const cancel = clock.after(wait, () => {
      building = null;
      report(fail ? 'failed' : 'succeeded', apps);
    });

    building = { apps, cancel };
  };

  const start = (): readonly string[] => {
    const apps = random.next() < FRONT_SHARE ? deploys.front : deploys.back;
    report('started', apps);

    return apps;
  };

  return {
    send(outcome) {
      const apps = building?.apps ?? start();
      building?.cancel();

      build(apps, outcome === 'failed', MIN_REAL_BUILD_MS);
    },
    step(hour, minutes) {
      if (building !== null || hour < deploys.firstHour || hour >= deploys.lastHour) return;

      const workingMinutes = (deploys.lastHour - deploys.firstHour) * 60;
      if (random.next() >= (deploys.perDay / workingMinutes) * minutes) return;

      const [shortest, longest] = deploys.buildMinutes;
      const buildMinutes = shortest + random.next() * (longest - shortest);
      const fail = random.next() < deploys.failureChance;

      build(start(), fail, Math.max(MIN_REAL_BUILD_MS, (buildMinutes * 60_000) / speed()));
    },
    stop: () => building?.cancel(),
  };
}
