import type { Archetype, DeployStep, EventText, GaugeMove, Language, Rarity, SourceEvent } from '@deskorama/core';

/** What one GitHub Event is made of, before it is named after its Source. */
export interface GithubEventParts {
  /** Stable for the same fact, so a replay is dropped, e.g. "pr-412-merged". */
  readonly id: string;
  readonly kind: string;
  readonly archetype: Archetype;
  readonly rarity: Rarity;
  /** When it happened, in milliseconds since the epoch. */
  readonly at: number;
  readonly text: Readonly<Record<Language, EventText>>;
  readonly step?: DeployStep;
  readonly gauge?: GaugeMove;
}

/**
 * Returns a Source Event of a GitHub repository: every kind the Connector reads has a Role, so it is recognised.
 * @example
 * githubEvent('Tramlo', { id: 'pr-412-merged', kind: 'pull_request.merged', archetype: 'approval', … });
 * // { id: 'pr-412-merged', …, recognised: true, source: 'Tramlo', at: Date }
 */
export function githubEvent(source: string, parts: GithubEventParts): SourceEvent {
  const { at, ...rest } = parts;

  return { ...rest, recognised: true, source, at: new Date(at) };
}
