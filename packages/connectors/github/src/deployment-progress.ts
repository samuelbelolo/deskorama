import type { DeployStep } from '@deskorama/core';
import type { DeploymentStatus } from './deployment-status-schema.ts';

/** Where a deployment stands after its latest status. */
export type DeploymentProgress =
  | { readonly kind: 'going' }
  | { readonly kind: 'done'; readonly step: Exclude<DeployStep, 'started'>; readonly at: number }
  /** Marked inactive, such as an older deployment replaced by a newer one: it ends with no Event. */
  | { readonly kind: 'retired' };

/**
 * Returns where a deployment stands after its statuses: still going while it has none or its latest one is
 * queued, pending or in progress, then succeeded or failed.
 * @example
 * deploymentProgress([{ id: 2, state: 'success', created_at: t }, { id: 1, state: 'in_progress', … }]);
 * // { kind: 'done', step: 'succeeded', at: t }
 */
export function deploymentProgress(statuses: readonly DeploymentStatus[]): DeploymentProgress {
  const latest = statuses.reduce<DeploymentStatus | null>(
    (newest, status) => (newest === null || status.id > newest.id ? status : newest),
    null,
  );

  if (latest === null) return { kind: 'going' };

  if (latest.state === 'success') return { kind: 'done', step: 'succeeded', at: latest.created_at };

  if (latest.state === 'failure' || latest.state === 'error') {
    return { kind: 'done', step: 'failed', at: latest.created_at };
  }

  if (latest.state === 'inactive') return { kind: 'retired' };

  return { kind: 'going' };
}
