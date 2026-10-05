import type { Language } from '@deskorama/core';
import { failureText } from '../../shared/failure-text.ts';
import { shortTime } from '../../shared/short-time.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import type { StatusKind } from './status-line.ts';
import { SETTINGS_TEXT } from './text/text-by-language.ts';

/** Where a Source stands, as the window says it, and what the person can do about it. */
export interface SourceStanding {
  readonly kind: StatusKind;
  readonly sentence: string;
  /** What fixes it when only the person can: a new token, or a token with the missing permission. */
  readonly fix: 'token' | 'permission' | null;
}

/**
 * Returns where a Source stands, in the display language. A rate limit or an unreachable service is waited out by
 * the app; a refused token, a missing permission or an answer it cannot read needs the person, and counts in the
 * sidebar.
 * @example
 * sourceStanding({ state: 'failing', failure: { kind: 'auth' }, at }, 'en');
 * // { kind: 'bad', sentence: 'Token refused: paste a new one.', fix: 'token' }
 */
export function sourceStanding(status: SourceStatus, lang: Language): SourceStanding {
  const text = SETTINGS_TEXT[lang];

  if (status.state === 'waiting') return { kind: 'wait', sentence: text.waiting, fix: null };

  if (status.state === 'ok') return { kind: 'ok', sentence: text.readAt(shortTime(status.at, lang)), fix: null };

  const { failure } = status;
  const sentence = failureText(failure, lang);

  if (failure.kind === 'rate-limit' || failure.kind === 'network') return { kind: 'wait', sentence, fix: null };

  if (failure.kind === 'auth') return { kind: 'bad', sentence, fix: 'token' };

  return { kind: 'bad', sentence, fix: failure.kind === 'permission' ? 'permission' : null };
}
