import type { DeployStep } from './deploy-step.ts';
import type { BuildState } from './gauge-values.ts';

/** The build state each deploy step leaves production in. */
const AFTER: Readonly<Record<DeployStep, BuildState>> = { started: 'building', succeeded: 'ready', failed: 'error' };

/**
 * Returns the build state a deploy step leaves production in. It stays there until the next deploy step: no timer
 * turns it back to idle.
 * @example
 * buildStateAfter('started'); // "building"
 * buildStateAfter('failed'); // "error"
 */
export function buildStateAfter(step: DeployStep): BuildState {
  return AFTER[step];
}
