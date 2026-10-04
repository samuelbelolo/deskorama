import type { Archetype } from './archetype.ts';

/**
 * Returns true for a deploy its Source described: the only Event whose deploy step counts. A step sent with another
 * Role, or with a kind nobody described, is dropped.
 * @example
 * isDescribedDeploy({ archetype: 'deploy', recognised: true }); // true
 * isDescribedDeploy({ archetype: 'error', recognised: true }); // false
 */
export function isDescribedDeploy(event: {
  readonly archetype: Archetype | null;
  readonly recognised: boolean;
}): boolean {
  return event.archetype === 'deploy' && event.recognised;
}
