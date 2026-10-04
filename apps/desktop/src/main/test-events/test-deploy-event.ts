import type { DeployStep, SourceEvent } from '@deskorama/core';
import { TEST_SOURCE } from './test-event.ts';
import { TEST_DEPLOY_TEXT } from './test-event-text.ts';

/**
 * Returns one step of a test deploy, with words in every language and a unique id; a failed step is the jackpot.
 * @example
 * testDeployEvent('failed', 'test-deploy-2', new Date(1791122400000)).rarity; // "jackpot"
 */
export function testDeployEvent(step: DeployStep, id: string, at: Date): SourceEvent {
  const { rarity, text } = TEST_DEPLOY_TEXT[step];

  return {
    id,
    kind: `test.deploy.${step}`,
    archetype: 'deploy',
    recognised: true,
    rarity,
    source: TEST_SOURCE,
    at,
    text,
    step,
  };
}
