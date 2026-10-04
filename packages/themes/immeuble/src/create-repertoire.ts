import type { Archetype, WallpaperEvent } from '@deskorama/core';
import { alternate } from './alternate.ts';
import type { Gag } from './gag.ts';
import { playBanner } from './play-banner.ts';
import { playBinned } from './play-binned.ts';
import { playCalculator } from './play-calculator.ts';
import { playChat } from './play-chat.ts';
import { playCheckpoint } from './play-checkpoint.ts';
import { playCross } from './play-cross.ts';
import { playDelivery } from './play-delivery.ts';
import { playEraser } from './play-eraser.ts';
import { playFireworks } from './play-fireworks.ts';
import { playLetterbox } from './play-letterbox.ts';
import { playLike } from './play-like.ts';
import { playNewcomer } from './play-newcomer.ts';
import { playPiggyBank } from './play-piggy-bank.ts';
import { playPrinter } from './play-printer.ts';
import { playRedCarpet } from './play-red-carpet.ts';
import { createRedScreen } from './create-red-screen.ts';
import { playRegister } from './play-register.ts';
import { playStamp } from './play-stamp.ts';
import { playThumbDown } from './play-thumb-down.ts';
import { roleOf } from './role-of.ts';

/** Picks the Gag of an Event. */
export type Repertoire = (event: WallpaperEvent) => Gag;

/**
 * Returns the Gags of one screen, one per Role but the deploy, typed by `Archetype` so a new Role does not compile
 * until it has a Gag; the busy Roles take turns between two pictures, each screen keeping its own turns. A Gag is
 * chosen by the Event's Role only: never by its kind, never by its Source. An Event without a Role or of a kind
 * nobody described plays the delivery, and so does a deploy that reaches the director, which the site should have
 * taken.
 * @example
 * const gagFor = createRepertoire();
 * gagFor(event)(event, env);
 */
export function createRepertoire(): Repertoire {
  const gags: Readonly<Record<Exclude<Archetype, 'deploy'> | 'other', Gag>> = {
    arrival: alternate([playNewcomer, playLetterbox]),
    partner: playRedCarpet,
    departure: playEraser,
    approval: playStamp,
    rejection: alternate([playThumbDown, playCross]),
    abandon: playBinned,
    like: playLike,
    message: playChat,
    publish: playBanner,
    usage: alternate([playPrinter, playCalculator]),
    money: alternate([playRegister, playPiggyBank]),
    error: createRedScreen(),
    blocked: playCheckpoint,
    celebration: playFireworks,
    other: playDelivery,
  };

  return (event) => {
    const role = roleOf(event);

    return role === 'deploy' ? playDelivery : gags[role];
  };
}
