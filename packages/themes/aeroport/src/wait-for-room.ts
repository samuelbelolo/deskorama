import type { Cancel, Clock } from '@deskorama/core';

/** How often a Gag that found no room looks again. */
export const ROOM_RETRY_MS = 500;

/** How long a Gag waits for room before it gives up, so a burst is spread out but never piles up for ever. */
export const ROOM_WAIT_MS = 8000;

/**
 * Plays as soon as `find` returns room, looking again every {@link ROOM_RETRY_MS} until {@link ROOM_WAIT_MS} have
 * passed, then gives up. Returns what stops the wait or the Gag it started.
 * @example
 * const stop = waitForRoom(host.clock, () => host.freeSpot({ w: 300, h: 200 }), (spot) => play(spot), done);
 */
export function waitForRoom<Room>(
  clock: Clock,
  find: () => Room | null,
  play: (room: Room) => Cancel,
  giveUp: () => void,
): Cancel {
  const started = clock.now();
  let cancel: Cancel | null = null;

  const attempt = (): void => {
    const room = find();
    if (room !== null) cancel = play(room);
    else if (clock.now() - started >= ROOM_WAIT_MS) giveUp();
    else cancel = clock.after(ROOM_RETRY_MS, attempt);
  };

  attempt();

  return () => cancel?.();
}
