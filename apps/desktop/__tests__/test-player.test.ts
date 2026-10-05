import { ARCHETYPES, THEME_MOMENTS, type SourceEvent } from '@deskorama/core';
import { createFakeClock, FIXTURE_TIME } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createTestPlayer } from '../src/main/test-events/create-test-player.ts';

/**
 * Returns a test player on a fake Clock, and the Events it sent.
 * @example
 * const { tests, sent } = setUp();
 * tests.play('money');
 * sent.length; // 1
 */
function setUp() {
  const clock = createFakeClock(FIXTURE_TIME);
  const sent: SourceEvent[] = [];
  let restored = 0;

  const tests = createTestPlayer(
    clock,
    (event) => void sent.push(event),
    () => (restored += 1),
  );

  return { tests, sent, clock, restored: () => restored };
}

describe('the test Events of the settings window', () => {
  test('play one Event per Role, worded in both languages, each with its own id', () => {
    const { tests, sent } = setUp();

    for (const choice of THEME_MOMENTS) tests.play(choice);

    expect(sent.map((event) => event.archetype)).toEqual([...ARCHETYPES, 'deploy']);
    expect(new Set(sent.map((event) => event.id)).size).toBe(sent.length);

    for (const event of sent) {
      expect(event).toMatchObject({ recognised: true, source: 'Test' });
      expect(event.text.fr.label).not.toBe('');
      expect(event.text.en.label).not.toBe('');
      expect(event.gauge).toBeUndefined();
    }
  });

  test('start a deploy, end it a few seconds later, then show the real build state once its scene is over', () => {
    const { tests, sent, clock, restored } = setUp();

    tests.play('deploy');
    tests.play('failed-deploy');

    expect(sent.map((event) => event.step)).toEqual(['started', 'started']);

    clock.advance(8000);

    expect(sent.slice(2).map(({ step, rarity }) => ({ step, rarity }))).toEqual([
      { step: 'succeeded', rarity: 'notable' },
      { step: 'failed', rarity: 'jackpot' },
    ]);
    expect(restored()).toBe(0);

    clock.advance(30_000);

    expect(restored()).toBe(2);
  });

  test('cancel a deploy still building when the app quits', () => {
    const { tests, sent, clock } = setUp();

    tests.play('deploy');
    tests.stop();
    clock.advance(8000);

    expect(sent).toHaveLength(1);
  });
});
