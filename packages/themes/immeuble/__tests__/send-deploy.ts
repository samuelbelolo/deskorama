import type { BuildState, DeployStep, Language } from '@deskorama/core';
import type { FakeScreenHost } from '@deskorama/test-utils';
import { deployEvent } from './deploy-event.ts';

/** The build state each deploy step leaves production in, as the engine sets it before the Event plays. */
const BUILD: Readonly<Record<DeployStep, BuildState>> = { started: 'building', succeeded: 'ready', failed: 'error' };

/**
 * Sends a deploy step the way the engine does: the build state moves first, then the Event arrives.
 * @example
 * sendDeploy(host, 'fr', 'started');
 */
export function sendDeploy(host: FakeScreenHost, lang: Language, step: DeployStep, tag?: string): void {
  host.setGauges({ build: BUILD[step] });
  host.send(deployEvent(lang, step, tag));
}
