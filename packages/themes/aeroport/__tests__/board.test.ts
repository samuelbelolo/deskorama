import type { SourceEvent } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';
import { afterEach, describe, expect, test } from 'vitest';
import { boardRow } from '../src/board-row.ts';
import { FRESH_MS } from '../src/create-board.ts';
import { textFor } from '../src/text-for.ts';
import { AFTERNOON } from './instants.ts';
import { mountAirport, type MountedAirport } from './mount-airport.ts';

let mounted: MountedAirport | undefined;

afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  document.body.replaceChildren();
});

/**
 * Returns what one field of the board reads, without its blank cells, and its tone.
 * @example
 * field(layer, 'board-row-0-status'); // { text: "MERGED", tone: "news" }
 */
function field(layer: HTMLElement, part: string): { text: string; tone: string } {
  const node = layer.querySelector<HTMLElement>(`[data-part="${part}"]`);

  return { text: (node?.textContent ?? '').trim(), tone: node?.dataset['tone'] ?? '' };
}

/**
 * Returns an Event in French with its own words.
 * @example
 * frenchEvent({ label: 'Nouvelle inscription', tag: 'ESSAI' }, { archetype: 'arrival' });
 */
function frenchEvent(words: { label: string; tag: string }, overrides: Partial<SourceEvent> = {}) {
  const event = wallpaperEventFixture('fr', overrides);

  return { ...event, label: words.label, meta: { ...event.meta, tag: words.tag } };
}

describe("L'Aéroport's Departures board", () => {
  test('lists the Event that just arrived on top, bright, then dims it', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(wallpaperEventFixture('en'));
    host.clock.advance(1000);

    expect(field(layer, 'board-row-0-flight')).toEqual({ text: 'PULL REQUEST', tone: 'fresh' });
    expect(field(layer, 'board-row-0-status').text).toBe('MERGED');
    expect(field(layer, 'board-row-0-time').text).toMatch(/^\d\d:\d\d$/);

    host.clock.advance(FRESH_MS);
    expect(field(layer, 'board-row-0-flight').tone).toBe('dim');
  });

  test('flips bad news in orange, and good news never', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    host.send(frenchEvent({ label: 'Branche supprimée', tag: 'BRANCHE' }, { id: 'gone', archetype: 'departure' }));
    expect(field(layer, 'board-row-0-status').tone).toBe('fresh');

    host.send(frenchEvent({ label: 'Erreur en production', tag: 'CI' }, { id: 'broke', archetype: 'error' }));
    expect(field(layer, 'board-row-0-status').tone).toBe('news');
  });

  test('flips its letters through the drum instead of jumping to them', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON });
    const { host, layer } = mounted;
    host.send(wallpaperEventFixture('en'));
    host.clock.advance(70);

    expect(field(layer, 'board-row-0-status').text).not.toBe('MERGED');
  });

  test('shows the letters at once with reduced motion', () => {
    mounted = mountAirport({ lang: 'en', start: AFTERNOON, reducedMotion: true });
    mounted.host.send(wallpaperEventFixture('en'));

    expect(field(mounted.layer, 'board-row-0-status').text).toBe('MERGED');
  });

  test('moves older rows down and never lists a deploy', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    host.send(wallpaperEventFixture('fr'));
    host.send(wallpaperEventFixture('fr', { id: 'deploy', archetype: 'deploy', step: 'started' }));
    host.send(wallpaperEventFixture('fr', { id: 'mail', archetype: null, recognised: false, source: 'Mail' }));

    expect(field(layer, 'board-row-0-flight').text).toBe('MAIL');
    expect(field(layer, 'board-row-0-status').text).toBe('NON RECONNU');
    expect(field(layer, 'board-row-1-status').text).toBe('MERGÉE');
    expect(field(layer, 'board-row-2-flight').text).toBe('');
  });

  test('shows the runway clear, in use while a deploy runs, and closed after a failure', () => {
    mounted = mountAirport({ lang: 'fr', start: AFTERNOON, reducedMotion: true });
    const { host, layer } = mounted;
    const root = layer.querySelector('[data-theme="aeroport"]');
    expect(field(layer, 'board-runway')).toEqual({ text: 'LIBRE', tone: 'plain' });

    host.setGauges({ build: 'building' });
    expect(field(layer, 'board-runway')).toEqual({ text: 'OCCUPÉE', tone: 'plain' });
    expect(root?.classList.contains('is-closed')).toBe(false);

    host.setGauges({ build: 'error' });
    expect(field(layer, 'board-runway')).toEqual({ text: 'FERMÉE', tone: 'news' });
    expect(root?.classList.contains('is-closed')).toBe(true);
  });
});

describe('A board row', () => {
  const fr = textFor('fr');

  test.each([
    [
      { label: 'Nouvelle inscription', tag: 'ESSAI' },
      { flight: 'INSCRIPTION', status: 'ESSAI' },
    ],
    [
      { label: 'Robot bloqué par le captcha', tag: 'CAPTCHA' },
      { flight: 'ROBOT BLOQUÉ', status: 'CAPTCHA' },
    ],
    [
      { label: 'Branche supprimée après merge', tag: 'BRANCHE' },
      { flight: 'BRANCHE', status: 'SUPPRIMÉE' },
    ],
    [
      { label: 'Paiement reçu', tag: '+49 €' },
      { flight: 'PAIEMENT REÇU', status: '+49 €' },
    ],
    [
      { label: 'Essai terminé', tag: '' },
      { flight: 'ESSAI TERMINÉ', status: 'ABANDON' },
    ],
  ])('reads %o as %o', (words, row) => {
    expect(boardRow(frenchEvent(words, { archetype: words.tag === '' ? 'abandon' : 'approval' }), fr)).toEqual(row);
  });

  test('keeps only letters the drum can show', () => {
    const row = boardRow(frenchEvent({ label: 'Revue « urgente » @équipe', tag: 'OK!' }), fr);

    expect(row).toEqual({ flight: 'REVUE URGENTE', status: 'OK!' });
  });
});
