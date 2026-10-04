import type { Archetype, WallpaperEvent } from '@deskorama/core';
import { playAbandon } from './play-abandon.ts';
import { playApproval } from './play-approval.ts';
import { playArrival } from './play-arrival.ts';
import { playBlocked } from './play-blocked.ts';
import { playCelebration } from './play-celebration.ts';
import { playDeparture } from './play-departure.ts';
import { playError } from './play-error.ts';
import { playLike } from './play-like.ts';
import { playMessage } from './play-message.ts';
import { playMoney } from './play-money.ts';
import { playPartner } from './play-partner.ts';
import { playGenericGag } from './play-generic-gag.ts';
import { playPublish } from './play-publish.ts';
import { playRejection } from './play-rejection.ts';
import { isDescribed } from './is-described.ts';
import type { Gag } from './stage.ts';
import { playUsage } from './play-usage.ts';

/**
 * One Gag per Role but the deploy, whose PROD flight plays on every screen at once, outside the queue of Gags.
 * Typed by `Archetype`, so a new Role does not compile until it has a Gag.
 */
const GAGS: Readonly<Record<Exclude<Archetype, 'deploy'>, Gag>> = {
  arrival: playArrival,
  partner: playPartner,
  departure: playDeparture,
  approval: playApproval,
  rejection: playRejection,
  abandon: playAbandon,
  like: playLike,
  celebration: playCelebration,
  message: playMessage,
  publish: playPublish,
  usage: playUsage,
  money: playMoney,
  error: playError,
  blocked: playBlocked,
};

/**
 * Returns the Gag for an Event, chosen by its Role only: never by its kind, never by its Source. An Event from a
 * foreign Source (no Role) or of a kind nobody described plays the generic Gag; so does a deploy that reaches the
 * director, which the PROD flight should have taken.
 * @example
 * gagFor(event)(stage, event, next);
 */
export function gagFor(event: WallpaperEvent): Gag {
  if (!isDescribed(event) || event.archetype === 'deploy') return playGenericGag;

  return GAGS[event.archetype];
}
