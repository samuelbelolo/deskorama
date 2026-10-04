import type { Archetype, WallpaperEvent } from '@deskorama/core';
import { playAbandon } from './play-abandon.ts';
import { playApproval } from './play-approval.ts';
import { playArrival } from './play-arrival.ts';
import { playBlocked } from './play-blocked.ts';
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
 * One Gag per Role. The celebration and the deploy flight play the generic Gag until their own scenes exist.
 * Typed by `Archetype`, so a new Role does not compile until it has a Gag.
 */
const GAGS: Readonly<Record<Archetype, Gag>> = {
  arrival: playArrival,
  partner: playPartner,
  departure: playDeparture,
  approval: playApproval,
  rejection: playRejection,
  abandon: playAbandon,
  like: playLike,
  celebration: playGenericGag,
  message: playMessage,
  publish: playPublish,
  usage: playUsage,
  money: playMoney,
  error: playError,
  blocked: playBlocked,
  deploy: playGenericGag,
};

/**
 * Returns the Gag for an Event, chosen by its Role only: never by its kind, never by its Source. An Event from a
 * foreign Source (no Role) or of a kind nobody described plays the generic Gag.
 * @example
 * gagFor(event)(stage, event, next);
 */
export function gagFor(event: WallpaperEvent): Gag {
  return isDescribed(event) ? GAGS[event.archetype] : playGenericGag;
}
