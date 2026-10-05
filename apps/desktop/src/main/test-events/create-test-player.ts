import type { Clock, SourceEvent, ThemeMoment } from '@deskorama/core';
import { testDeployEvent } from './test-deploy-event.ts';
import { testEvent } from './test-event.ts';

/** How long a test deploy builds before it ends, so its start plays first. */
const DEPLOY_BUILD_MS = 8000;

/** How long the scene of a test deploy's end lasts before production shows its real state again. */
const DEPLOY_SHOW_MS = 30_000;

/** What plays the test Events. */
export interface TestPlayer {
  play(choice: ThemeMoment): void;
  /** Cancels the deploys still running. */
  stop(): void;
}

/**
 * Returns what plays test Events through `send`, the same way a Source's Events go to the wallpapers. A deploy
 * starts, then succeeds a few seconds later; the failed deploy starts, then fails. Once the end has played,
 * `restoreBuild` shows where production really stands, so a test never leaves it looking built or broken.
 * @example
 * const tests = createTestPlayer(clock, sendEvent, () => scene.restoreBuild());
 * tests.play('celebration'); // the Theme plays its celebration Gag at once
 * tests.play('failed-deploy'); // a deploy starts, fails 8 seconds later, and the real build state is back after 30
 */
export function createTestPlayer(
  clock: Clock,
  send: (event: SourceEvent) => void,
  restoreBuild: () => void,
): TestPlayer {
  const running = new Set<() => void>();
  let count = 0;

  const id = (name: string): string => `test-${name}-${clock.now()}-${++count}`;

  const at = (): Date => new Date(clock.now());

  /** Runs `then` after `delay`, unless the player stops first. */
  const later = (delay: number, then: () => void): void => {
    const cancel = clock.after(delay, () => {
      running.delete(cancel);
      then();
    });

    running.add(cancel);
  };

  return {
    play(choice) {
      if (choice !== 'deploy' && choice !== 'failed-deploy') {
        send(testEvent(choice, id(choice), at()));

        return;
      }

      send(testDeployEvent('started', id('deploy'), at()));

      later(DEPLOY_BUILD_MS, () => {
        send(testDeployEvent(choice === 'failed-deploy' ? 'failed' : 'succeeded', id('deploy'), at()));

        later(DEPLOY_SHOW_MS, restoreBuild);
      });
    },

    stop() {
      for (const cancel of running) cancel();

      running.clear();
    },
  };
}
