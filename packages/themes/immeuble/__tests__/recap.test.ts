import type { Recap } from '@deskorama/core';
import { afterEach, describe, expect, test } from 'vitest';
import { RECAP_SHOW_MS } from '../src/create-recap-board.ts';
import { boxOf } from './box-of.ts';
import { DEFAULT_WINDOWS } from './default-windows.ts';
import { AFTERNOON } from './instants.ts';
import { mountBuilding, type MountedBuilding } from './mount-building.ts';
import { group } from './recap-group.ts';

let mounted: MountedBuilding | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/** Two hours away: a milestone, five merges, two CI failures, a foreign mail, and four Events in Roles left out. */
const RECAP: Recap = {
  from: new Date(AFTERNOON - 2 * 3_600_000),
  to: new Date(AFTERNOON),
  total: 13,
  groups: [
    group('celebration', 'rare', 1),
    group('approval', 'notable', 5),
    group('error', 'common', 2),
    group(null, 'common', 1),
  ],
  more: 4,
};

/**
 * Returns what the board says: its title's total and each cell's count and noun.
 * @example
 * board(layer); // { total: 13, cells: ["1 GRAND MOMENT", "5 VALIDATIONS", ...] }
 */
function board(layer: HTMLElement): { readonly total: number; readonly cells: readonly string[] } {
  const title = layer.querySelector('[data-part="recap-title"]')?.textContent?.trim() ?? '';
  const cells = Array.from(
    layer.querySelectorAll('[data-part="recap-cell"]'),
    (node) => node.textContent?.trim() ?? '',
  );

  return { total: Number(/(\d+)$/u.exec(title)?.[1] ?? Number.NaN), cells };
}

/**
 * Returns the sum of the counts the cells show.
 * @example
 * sum(['1 GRAND MOMENT', '5 VALIDATIONS']); // 6
 */
function sum(cells: readonly string[]): number {
  return cells.reduce((total, cell) => total + Number(/^(\d+)/u.exec(cell)?.[1] ?? 0), 0);
}

describe("L'Immeuble's recap", () => {
  test('lists the missed Roles rarest first under what was missed, and the rest as others', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    mounted.host.sendRecap(RECAP);
    mounted.host.clock.advance(3000);

    expect(mounted.layer.querySelector('[data-part="recap-title"]')?.textContent).toContain('PENDANT TON ABSENCE');
    expect(board(mounted.layer)).toEqual({
      total: 13,
      cells: ['1 GRAND MOMENT', '5 VALIDATIONS', '2 ERREURS', '1 ÉVÉNEMENT', '4 AUTRES'],
    });
  });

  test('adds up on every frame while it counts, and ends on the recap’s total', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.sendRecap(RECAP);

    for (let elapsed = 0; elapsed < 2000; elapsed += 100) {
      host.clock.advance(100);
      const shown = board(layer);
      expect(shown.total).toBe(sum(shown.cells));
    }

    expect(board(layer).total).toBe(RECAP.total);
    expect(board(layer).cells).toContain('5 APPROVALS');
  });

  test('shows the final counts at once under reduced motion', () => {
    mounted = mountBuilding({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.sendRecap(RECAP);
    mounted.host.clock.advance(100);

    expect(board(mounted.layer).total).toBe(13);
  });

  test('fits behind the default windows, still adding up, and goes before a missed failed deploy replays', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames(DEFAULT_WINDOWS);
    host.sendRecap(RECAP);
    host.clock.advance(3000);

    const box = boxOf(layer, '[data-part="recap"]');
    expect(box !== null && host.visibleFraction(box)).toBe(1);
    expect(sum(board(layer).cells)).toBe(13);

    host.clock.advance(RECAP_SHOW_MS - 3000);
    expect(layer.querySelector('[data-part="recap"]')).toBeNull();
    expect(RECAP_SHOW_MS).toBeLessThan(8000);
  });

  test('waits for a window to move when nothing shows, until its time is up', () => {
    mounted = mountBuilding({ lang: 'fr', start: AFTERNOON });
    const { host, layer } = mounted;
    host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
    host.sendRecap(RECAP);
    host.clock.advance(1000);

    host.setWindowFrames([]);
    host.clock.advance(3000);
    expect(board(layer).total).toBe(13);
  });
});
