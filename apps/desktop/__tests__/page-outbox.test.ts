import { describe, expect, test } from 'vitest';
import { createPageOutbox } from '../src/main/wallpapers/create-page-outbox.ts';

/**
 * Returns an outbox and what its page received.
 * @example
 * const { outbox, received } = setUp();
 * outbox.send('event', 1);
 * received; // [] until the page listens
 */
function setUp() {
  const received: [string, unknown][] = [];
  const outbox = createPageOutbox((channel, payload) => void received.push([channel, payload]));

  return { outbox, received };
}

describe('the messages of a wallpaper page', () => {
  test('wait while the page loads, then arrive in order, and at once from then on', () => {
    const { outbox, received } = setUp();

    outbox.send('state', 1);
    outbox.send('event', 2);

    expect(received).toEqual([]);

    outbox.open();
    outbox.send('event', 3);

    expect(received).toEqual([
      ['state', 1],
      ['event', 2],
      ['event', 3],
    ]);
  });

  test('are forgotten for a page that never loads or whose window closed', () => {
    const { outbox, received } = setUp();

    outbox.send('event', 1);
    outbox.drop();
    outbox.send('event', 2);
    outbox.open();

    expect(received).toEqual([]);
  });
});
