import type { SourceEvent } from '@deskorama/core';
import { sourceEventFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createWebhookControl, type WebhookControlOptions } from '../src/main/create-webhook-control.ts';
import { withWebhookOn } from '../src/main/with-webhook-on.ts';

/**
 * Returns a control over fake listeners, and what a test watches: the listeners made with their secret, the
 * choices saved, the Events handed on, the failures reported and how often it said it changed.
 * @example
 * const run = setUp({ on: false });
 * await run.control.start();
 * run.listeners; // []
 */
function setUp(options: Partial<WebhookControlOptions> & { readonly taken?: boolean } = {}) {
  const listeners: { secret: string; listening: boolean; accept: (event: SourceEvent) => void }[] = [];
  const saved: boolean[] = [];
  const played: SourceEvent[] = [];
  const errors: unknown[] = [];
  let drawn = 0;
  let changes = 0;

  const control = createWebhookControl({
    on: true,
    port: 47_213,
    secret: 'first-secret-of-the-test',
    redraw: () => `secret-drawn-${++drawn}`,
    saveOn: (on) => void saved.push(on),
    listen(secret, accept) {
      const listener = { secret, listening: false, accept };

      listeners.push(listener);

      return {
        async start() {
          if (options.taken === true) throw new Error('EADDRINUSE');

          listener.listening = true;

          return 47_213;
        },
        stop: async () => void (listener.listening = false),
      };
    },
    onEvent: (event) => void played.push(event),
    onError: (error) => void errors.push(error),
    ...options,
  });

  control.onChange(() => void (changes += 1));

  return { control, listeners, saved, played, errors, changes: () => changes };
}

describe('the Local webhook control', () => {
  test('listens when the person left it on, and hands on and remembers the Events it accepts, newest first', async () => {
    const run = setUp();

    await run.control.start();

    expect(run.control.state()).toEqual({ on: true, listening: true, port: 47_213 });

    for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) run.listeners[0]?.accept(sourceEventFixture({ id }));

    expect(run.played.map((event) => event.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(run.control.recent().map((event) => event.id)).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  test('stays silent when the person turned it off, until turned on again, and keeps each choice', async () => {
    const run = setUp({ on: false });

    await run.control.start();

    expect(run.listeners).toEqual([]);
    expect(run.control.state()).toMatchObject({ on: false, listening: false });

    await run.control.setOn(true);

    expect(run.control.state()).toMatchObject({ on: true, listening: true });

    await run.control.setOn(false);

    expect(run.control.state()).toMatchObject({ on: false, listening: false });
    expect(run.listeners.map((listener) => listener.listening)).toEqual([false]);
    expect(run.saved).toEqual([true, false]);
  });

  test('reports a port already taken, and runs on without listening', async () => {
    const run = setUp({ taken: true });

    await run.control.start();

    expect(run.control.state()).toEqual({ on: true, listening: false, port: 47_213 });
    expect(run.errors).toHaveLength(1);
  });

  test('reports a secret its listener refuses, and runs on without listening', async () => {
    const run = setUp({
      listen: () => {
        throw new Error('The Local webhook secret needs at least 16 characters.');
      },
    });

    await run.control.start();

    expect(run.control.state()).toEqual({ on: true, listening: false, port: 47_213 });
    expect(run.errors).toHaveLength(1);
  });

  test('draws a new secret and listens with it alone', async () => {
    const run = setUp();

    await run.control.start();
    await run.control.regenerate();

    expect(run.control.secret()).toBe('secret-drawn-1');
    expect(run.listeners.map(({ secret, listening }) => ({ secret, listening }))).toEqual([
      { secret: 'first-secret-of-the-test', listening: false },
      { secret: 'secret-drawn-1', listening: true },
    ]);
  });

  test('keeps a secret fixed from outside the app', async () => {
    const run = setUp({ redraw: null });

    await run.control.start();
    await run.control.regenerate();

    expect(run.control.canRegenerate).toBe(false);
    expect(run.control.secret()).toBe('first-secret-of-the-test');
    expect(run.listeners).toHaveLength(1);
  });

  test('keeps its secret and its state when the new secret cannot be kept, and still answers afterwards', async () => {
    const run = setUp({
      redraw: () => {
        throw new Error('The Keychain refused.');
      },
    });

    await run.control.start();

    await expect(run.control.regenerate()).rejects.toThrow('The Keychain refused.');

    expect(run.control.secret()).toBe('first-secret-of-the-test');
    expect(run.control.state().listening).toBe(true);

    await run.control.setOn(false);

    expect(run.control.state().listening).toBe(false);
  });

  test('runs one change at a time, and tells its listeners after each change and each Event', async () => {
    const run = setUp();

    await Promise.all([run.control.start(), run.control.setOn(false), run.control.setOn(true)]);

    expect(run.control.state()).toMatchObject({ on: true, listening: true });
    expect(run.listeners.map((listener) => listener.listening)).toEqual([false, true]);
    expect(run.changes()).toBe(3);

    run.listeners[1]?.accept(sourceEventFixture({ id: 'a' }));

    expect(run.changes()).toBe(4);
  });
});

describe('the Local webhook’s choice in settings.json', () => {
  test('is written next to its port, with every other setting kept', () => {
    const before = '{"theme":"immeuble","localWebhook":{"port":5000}}';

    expect(JSON.parse(withWebhookOn(before, false))).toEqual({
      theme: 'immeuble',
      localWebhook: { port: 5000, enabled: false },
    });
    expect(JSON.parse(withWebhookOn(null, true))).toEqual({ localWebhook: { enabled: true } });
  });
});
