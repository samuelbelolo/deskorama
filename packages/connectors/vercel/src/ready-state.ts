/** Where a Vercel deployment stands, as its `readyState` says. */
export type ReadyState =
  | 'QUEUED'
  | 'INITIALIZING'
  | 'BUILDING'
  | 'READY'
  | 'ERROR'
  | 'CANCELED'
  | 'BLOCKED'
  | 'DELETED';

/** Every ready state Vercel documents: a deployment in any other state fails the poll loudly. */
export const READY_STATES: readonly ReadyState[] = [
  'QUEUED',
  'INITIALIZING',
  'BUILDING',
  'READY',
  'ERROR',
  'CANCELED',
  'BLOCKED',
  'DELETED',
];
