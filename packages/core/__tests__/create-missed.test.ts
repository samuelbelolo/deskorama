import { describe, expect, test } from 'vitest';
import { createMissed } from '../src/create-missed.ts';
import { localiseEvent } from '../src/localise-event.ts';
import type { SourceEvent } from '../src/source-event.ts';
import type { WallpaperEvent } from '../src/wallpaper-event.ts';
import { tramloEvent } from './tramlo.ts';

const FROM = new Date(Date.UTC(2026, 9, 4, 12));
const TO = new Date(Date.UTC(2026, 9, 4, 14));

/**
 * Returns a Tramlo Event in English, with the given fields.
 * @example
 * missedEvent({ id: 'like-1', archetype: 'like', rarity: 'common' }).label; // "Pull request merged"
 */
function missedEvent(overrides: Partial<SourceEvent>): WallpaperEvent {
  return localiseEvent(tramloEvent(overrides), 'en');
}

/**
 * Returns `count` Events of one Role, with ids made from `prefix`.
 * @example
 * several(3, 'like', { archetype: 'like', rarity: 'common' }).length; // 3
 */
function several(count: number, prefix: string, overrides: Partial<SourceEvent>): WallpaperEvent[] {
  return Array.from({ length: count }, (_, index) => missedEvent({ ...overrides, id: `${prefix}-${index}` }));
}

describe('the recap of what was missed', () => {
  test('groups the Events by Role, rarest first, then the most frequent', () => {
    const missed = createMissed();
    const events = [
      ...several(12, 'like', { archetype: 'like', rarity: 'common' }),
      ...several(3, 'arrival', { archetype: 'arrival', rarity: 'common' }),
      ...several(1, 'milestone', { archetype: 'celebration', rarity: 'rare' }),
      ...several(2, 'mail', { archetype: null, recognised: false, rarity: 'common' }),
    ];
    for (const event of events) missed.add(event);

    const recap = missed.recap(FROM, TO);

    expect(recap.groups.map((group) => [group.archetype, group.count])).toEqual([
      ['celebration', 1],
      ['like', 12],
      ['arrival', 3],
      [null, 2],
    ]);
    expect(recap).toMatchObject({ from: FROM, to: TO, total: 18, more: 0 });
  });

  test('ranks a group by its rarest Event and shows its newest one', () => {
    const missed = createMissed();
    missed.add(missedEvent({ id: 'a', archetype: 'money', rarity: 'common' }));
    missed.add(missedEvent({ id: 'b', archetype: 'money', rarity: 'jackpot' }));
    missed.add(missedEvent({ id: 'c', archetype: 'money', rarity: 'notable' }));

    const [group] = missed.recap(FROM, TO).groups;

    expect(group).toMatchObject({ archetype: 'money', rarity: 'jackpot', count: 3 });
    expect(group?.latest.id).toBe('c');
  });

  test('lists six Roles and counts the Events of the others in an "and N more" line', () => {
    const missed = createMissed();
    const roles = ['arrival', 'like', 'message', 'publish', 'usage', 'money', 'error', 'blocked'] as const;
    roles.forEach((archetype, index) => {
      for (const event of several(10 - index, archetype, { archetype, rarity: 'common' })) missed.add(event);
    });

    const recap = missed.recap(FROM, TO);

    expect(recap.groups.map((group) => group.archetype)).toEqual(roles.slice(0, 6));
    expect(recap.more).toBe(4 + 3);
    expect(recap.total).toBe(recap.groups.reduce((sum, group) => sum + group.count, 0) + recap.more);
  });

  test('keeps only the twelve latest Events to play after a short hide, oldest first', () => {
    const missed = createMissed();
    for (const event of several(20, 'push', { archetype: 'publish' })) missed.add(event);

    expect(missed.latest().map((event) => event.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `push-${index + 8}`),
    );
    expect(missed.recap(FROM, TO).total).toBe(20);
  });

  test('owes the latest missed deploy step when it failed or started, nothing when it succeeded', () => {
    const failed = missedEvent({ id: 'd1', archetype: 'deploy', rarity: 'jackpot', step: 'failed' });
    const fixed = missedEvent({ id: 'd2', archetype: 'deploy', rarity: 'common', step: 'succeeded' });
    const started = missedEvent({ id: 'd3', archetype: 'deploy', rarity: 'common', step: 'started' });

    const broken = createMissed();
    broken.add(failed);

    const retried = createMissed();
    retried.add(failed);
    retried.add(started);

    const repaired = createMissed();
    repaired.add(failed);
    repaired.add(fixed);

    expect(broken.owedDeploy()).toBe(failed);
    expect(retried.owedDeploy()).toBe(started);
    expect(repaired.owedDeploy()).toBeNull();
    expect(createMissed().owedDeploy()).toBeNull();
  });

  test('owes no deploy for a step sent with another Role, or with a kind nobody described', () => {
    const missed = createMissed();
    missed.add(missedEvent({ id: 'e1', archetype: 'error', step: 'failed' }));
    missed.add(missedEvent({ id: 'd1', archetype: 'deploy', recognised: false, step: 'failed' }));

    expect(missed.owedDeploy()).toBeNull();
  });
});
