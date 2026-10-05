import { createListeners, type Cancel, type SourceEvent } from '@deskorama/core';

/** How many of the latest accepted Events are remembered for the settings window. */
const REMEMBERED_EVENTS = 5;

/** A listener on the loopback interface, between `start` and `stop`. */
interface Listener {
  start(): Promise<number>;
  stop(): Promise<void>;
}

/** Where the Local webhook stands. */
interface WebhookState {
  /** Whether the person keeps it turned on. */
  readonly on: boolean;
  /** False while it is off, and when its port was taken. */
  readonly listening: boolean;
  readonly port: number;
}

/** What the control is made of. */
export interface WebhookControlOptions {
  readonly on: boolean;
  readonly port: number;
  readonly secret: string;
  /** Draws a new secret and keeps it; null when the secret is fixed from outside the app. */
  readonly redraw: (() => string) | null;
  /** Keeps the person's choice to have it on or off. */
  readonly saveOn: (on: boolean) => void;
  /** Makes a listener that accepts Events carrying `secret` and hands them to `onEvent`. */
  readonly listen: (secret: string, onEvent: (event: SourceEvent) => void) => Listener;
  /** Receives every accepted Event. */
  readonly onEvent: (event: SourceEvent) => void;
  /** Receives a failure to listen, e.g. a port already taken: reported, never fatal. */
  readonly onError: (error: unknown) => void;
}

/** The Local webhook as the menu bar and the settings window drive it. */
export interface WebhookControl {
  readonly state: () => WebhookState;
  readonly secret: () => string;
  readonly canRegenerate: boolean;
  /** The latest accepted Events since the app started, newest first. */
  readonly recent: () => readonly SourceEvent[];
  /** Listens if the person left it on; resolves once it does, or once the port proved taken. */
  start(): Promise<void>;
  /** Turns it on or off, and keeps that choice. */
  setOn(on: boolean): Promise<void>;
  /** Draws a new secret and listens with it: scripts holding the old one are turned away. */
  regenerate(): Promise<void>;
  /** Calls `listener` whenever its state, its secret or its latest Events change, until cancelled. */
  onChange(listener: () => void): Cancel;
  stop(): Promise<void>;
}

/**
 * Returns the control of the Local webhook: it listens while the person keeps it on, remembers the latest Events it
 * accepted, and swaps its listener when the secret is drawn again. One change runs at a time, so turning it off and
 * on quickly never leaves two listeners fighting over the port.
 * @example
 * const webhook = createWebhookControl({ on: true, port: 47213, secret, redraw, saveOn, listen, onEvent, onError });
 * await webhook.start();
 * webhook.state(); // { on: true, listening: true, port: 47213 }
 */
export function createWebhookControl(options: WebhookControlOptions): WebhookControl {
  const listeners = createListeners<void>();

  let on = options.on;
  let secret = options.secret;
  let listener: Listener | null = null;
  let recent: readonly SourceEvent[] = [];
  let queue: Promise<void> = Promise.resolve();

  const accept = (event: SourceEvent): void => {
    recent = [event, ...recent].slice(0, REMEMBERED_EVENTS);

    options.onEvent(event);
    listeners.emit();
  };

  const close = async (): Promise<void> => {
    const closing = listener;

    listener = null;

    await closing?.stop();
  };

  const open = async (): Promise<void> => {
    const opening = options.listen(secret, accept);

    try {
      await opening.start();

      listener = opening;
    } catch (error) {
      options.onError(error);
    }
  };

  /** Runs `change` after the changes already under way, whether they worked or not, then tells every listener. */
  const next = (change: () => Promise<void>): Promise<void> => {
    const done = queue.then(change).finally(() => listeners.emit());

    // A change that failed is reported to its caller, and never blocks the ones that follow.
    queue = done.catch(() => {});

    return done;
  };

  return {
    state: () => ({ on, listening: listener !== null, port: options.port }),
    secret: () => secret,
    canRegenerate: options.redraw !== null,
    recent: () => recent,

    start: () =>
      next(async () => {
        if (on) await open();
      }),

    setOn: (wanted) =>
      next(async () => {
        if (wanted === on) return;

        options.saveOn(wanted);
        on = wanted;

        await (wanted ? open() : close());
      }),

    regenerate: () =>
      next(async () => {
        if (options.redraw === null) return;

        secret = options.redraw();

        if (!on) return;

        await close();
        await open();
      }),

    onChange: (onChange) => listeners.add(onChange),

    stop: () => next(close),
  };
}
