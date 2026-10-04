import type { ReadyState } from './ready-state.ts';

/** Where one deployment stands, read by its id, once validated. */
export interface DeploymentStatus {
  readonly id: string;
  readonly readyState: ReadyState;
  /** When it finished, in milliseconds since the epoch. */
  readonly ready?: number | undefined;
}
