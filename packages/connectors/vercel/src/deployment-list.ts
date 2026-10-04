import type { ReadyState } from './ready-state.ts';

/** One deployment of the list, once validated: the fields the Connector reads, the rest is dropped. */
export interface ListedDeployment {
  readonly uid: string;
  /** The project's name, e.g. "tramlo-web". */
  readonly name: string;
  /** When it was created, in milliseconds since the epoch: the list filters on it. */
  readonly created: number;
  readonly readyState: ReadyState;
  /** "production" for a production deploy; null or absent for a preview. */
  readonly target?: string | null | undefined;
  /** When it finished, in milliseconds since the epoch. */
  readonly ready?: number | undefined;
  /** What the Git provider tells: the branch, the commit. */
  readonly meta?: Readonly<Record<string, unknown>> | undefined;
}

/** One page of a project's deployments, newest first. */
export interface DeploymentList {
  readonly deployments: readonly ListedDeployment[];
  readonly pagination: {
    /** The creation time to list before for the next, older page; null on the last page. */
    readonly next: number | null;
  };
}
