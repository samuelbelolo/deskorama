import { LOCAL_WEBHOOK_PROFILE } from '@deskorama/connector-local-webhook/profile';
import type { Screen } from '@deskorama/core';
import { createFakeHost, FIXTURE_TIME, type FakeHost } from '@deskorama/test-utils';
import { EVENT_CHANNEL, STATE_CHANNEL } from '../src/shared/wallpaper-bridge.ts';
import { createWallpaperStage, type WallpaperStage } from '../src/main/wallpapers/create-wallpaper-stage.ts';
import type { Scene } from '../src/shared/scene.ts';
import type { ScreenSetup } from '../src/shared/screen-setup.ts';

/** The MacBook's own display, at the origin of the desktop. */
export const BUILTIN: Screen = { id: 'builtin', x: 0, y: 0, width: 1728, height: 1117 };

/** A 1080p display left of the MacBook. */
export const LEFT: Screen = { id: 'left', x: -1920, y: 0, width: 1920, height: 1080 };

/** A 1440p display right of the MacBook. */
export const RIGHT: Screen = { id: 'right', x: 1728, y: 0, width: 2560, height: 1440 };

/** The scene of a new install on a Mac set to English. */
export const SCENE: Scene = { theme: 'aeroport', lang: 'en', source: LOCAL_WEBHOOK_PROFILE };

/** A wallpaper window that only records what it was opened with, what its page was sent and whether it closed. */
interface FakePort {
  readonly setup: ScreenSetup;
  readonly sent: { readonly channel: string; readonly payload: unknown }[];
  closed: boolean;
}

/** A stage over fake displays and fake windows. */
export interface StageRun {
  readonly stage: WallpaperStage;
  readonly host: FakeHost;
  /** Every window ever opened, in opening order. */
  readonly opened: readonly FakePort[];
  /** The window still open on the display with this id; throws when there is none. */
  on(id: string): FakePort;
  /** What the page of the window open on `id` was sent on `channel`, oldest first. */
  heard(id: string, channel: string): unknown[];
  /** The ids of the Events the page of the window open on `id` was sent to play, oldest first. */
  played(id: string): string[];
  /** What every screen shares, as the page of the window open on `id` last heard it. */
  shared(id: string): unknown;
}

/**
 * Starts a stage on `screens`, whose windows are fakes a test reads.
 * @example
 * const run = startStage([LEFT, BUILTIN, RIGHT]);
 * run.host.setScreens([BUILTIN]);
 * run.opened.filter((port) => port.closed).length; // 2
 */
export function startStage(screens: readonly Screen[]): StageRun {
  const host = createFakeHost({ screens, start: FIXTURE_TIME });
  const opened: FakePort[] = [];

  const stage = createWallpaperStage({
    host,
    scene: SCENE,
    seed: () => 7,
    open(setup) {
      const port: FakePort = { setup, sent: [], closed: false };

      opened.push(port);

      return {
        send: (channel, payload) => void port.sent.push({ channel, payload }),
        close: () => void (port.closed = true),
      };
    },
  });

  const on = (id: string): FakePort => {
    const port = opened.findLast((each) => each.setup.screen.id === id && !each.closed);

    if (port === undefined) throw new Error(`No wallpaper window is open on ${id}.`);

    return port;
  };

  const heard = (id: string, channel: string): unknown[] =>
    on(id).sent.flatMap((message) => (message.channel === channel ? [message.payload] : []));

  return {
    stage,
    host,
    opened,
    on,
    heard,
    played: (id) => heard(id, EVENT_CHANNEL).map(idOf),
    shared: (id) => heard(id, STATE_CHANNEL).at(-1),
  };
}

/**
 * Returns the id of an Event as a page was sent it; throws for anything else.
 * @example
 * idOf({ id: 'pr-1', kind: 'pull_request.merged' }); // "pr-1"
 */
function idOf(event: unknown): string {
  if (typeof event !== 'object' || event === null || !('id' in event) || typeof event.id !== 'string') {
    throw new Error('A page was sent an Event without an id.');
  }

  return event.id;
}
