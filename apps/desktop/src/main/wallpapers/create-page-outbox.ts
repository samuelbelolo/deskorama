/** The messages of one wallpaper page, kept in order until the page listens. */
export interface PageOutbox {
  /** Delivers a message, or keeps it while the page loads. */
  send(channel: string, payload: unknown): void;
  /** The page listens: delivers what was kept, in order, and everything sent from now on. */
  open(): void;
  /** The page will never listen: forgets what was kept and everything sent from now on. */
  drop(): void;
}

/**
 * Returns the outbox of a page that is still loading. A window plugged in while Events play is routed to at once,
 * before its page has loaded: nothing sent in the meantime is lost.
 * @example
 * const outbox = createPageOutbox((channel, payload) => window.webContents.send(channel, payload));
 * outbox.send(EVENT_CHANNEL, event); // kept
 * outbox.open(); // the page receives the Event
 */
export function createPageOutbox(deliver: (channel: string, payload: unknown) => void): PageOutbox {
  let waiting: { readonly channel: string; readonly payload: unknown }[] = [];
  let state: 'loading' | 'open' | 'dropped' = 'loading';

  return {
    send(channel, payload) {
      if (state === 'loading') waiting.push({ channel, payload });
      else if (state === 'open') deliver(channel, payload);
    },
    open() {
      if (state !== 'loading') return;

      state = 'open';

      const kept = waiting;

      waiting = [];

      for (const { channel, payload } of kept) deliver(channel, payload);
    },
    drop() {
      state = 'dropped';
      waiting = [];
    },
  };
}
