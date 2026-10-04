import type { Language, Rect } from '@deskorama/core';
import { packRecapRows } from './pack-recap-rows.ts';
import { moreCase } from './more-case.ts';
import type { RecapCase } from './recap-case.ts';
import type { Strings } from './strings.ts';
import { element } from './element.ts';

/** At most this many suitcases stand on the belt, the last one counting the rest. */
const MAX_CASES = 7;

/** The belt's height at the bottom of the panel, and the space between two suitcases. */
const BELT_HEIGHT = 16;
const CASE_GAP = 14;

/** How high a suitcase stands above the belt, how far apart rows of them stand, and below what height the panel is
 * too low to stack them. */
const CASE_LIFT = 24;
const ROW_PITCH = 30;
const LOW_PANEL = 120;

/** The suitcase colours, in turn along the belt. */
const COLOURS = ['var(--cobalt)', '#6b7a89', 'var(--kraft)', '#4f6b5e', 'var(--ink)'] as const;

/** The recap's panel, and the rollers that run under its still suitcases. */
export interface RecapBelt {
  readonly panel: HTMLElement;
  readonly rollers: HTMLElement;
}

/**
 * Draws the baggage claim panel in `rect`: the title plate with its note, the belt, and one still suitcase per case,
 * its tag readable in one look, stacked in rows when the panel is narrow. Suitcases that would not fit are folded
 * into the last one, "+ N more", so what the tags count always adds up to the total in the note.
 * @example
 * const belt = drawRecapBelt(root, rect, { heading, cases }, { text, lang: 'fr' });
 */
export function drawRecapBelt(
  parent: HTMLElement,
  rect: Rect,
  content: { readonly heading: { title: string; note: string }; readonly cases: readonly RecapCase[] },
  words: { readonly text: Strings; readonly lang: Language },
): RecapBelt {
  const panel = element('div', 'aeroport-recap', parent);
  panel.dataset['part'] = 'recap';
  panel.style.transform = `translate(${Math.round(rect.x)}px, ${Math.round(rect.y)}px)`;
  panel.style.width = `${Math.round(rect.w)}px`;
  panel.style.height = `${Math.round(rect.h)}px`;

  const plate = element('div', 'aeroport-recap-title', panel);
  plate.dataset['part'] = 'recap-title';
  element('span', '', plate).textContent = content.heading.title;
  const note = element('small', '', plate);
  note.dataset['part'] = 'recap-note';
  note.textContent = content.heading.note;

  const beltTop = rect.h - BELT_HEIGHT - 8;
  const belt = element('div', 'aeroport-recap-belt', panel);
  belt.style.top = `${beltTop}px`;
  const rollers = element('i', 'aeroport-recap-rollers', belt);

  // A low panel lines its suitcases up right of the title plate; a taller one stacks them in rows under it.
  const low = rect.h < LOW_PANEL;
  const left = low ? plate.offsetLeft + plate.offsetWidth + CASE_GAP : 14;
  const rows = low
    ? 1
    : Math.max(1, Math.floor((beltTop - CASE_LIFT - plate.offsetTop - plate.offsetHeight) / ROW_PITCH) + 1);
  const room = { rows, width: rect.w - left - 10, gap: CASE_GAP, max: MAX_CASES };

  const measured = content.cases.map((each) => ({ ...suitcase(panel, each), count: each.count }));
  const placements = packRecapRows(measured, room, (count) => {
    const probe = suitcase(panel, moreCase(count, words.text, words.lang));
    probe.node.remove();

    return probe.width;
  });

  for (const each of measured) each.node.remove();
  placements.forEach((place, i) => {
    const node =
      place.item === 'more'
        ? suitcase(panel, moreCase(place.count, words.text, words.lang)).node
        : measured[place.item]?.node;
    if (node === undefined) return;

    panel.append(node);
    node.style.transform = `translate(${left + place.x}px, ${beltTop - CASE_LIFT - place.row * ROW_PITCH}px)`;
    node.querySelector('i')?.style.setProperty('background', COLOURS[i % COLOURS.length] ?? COLOURS[0]);
  });

  return { panel, rollers };
}

/**
 * Returns one suitcase on the panel, with its tag, and its measured width.
 * @example
 * suitcase(panel, { label: '5 validations', count: 5, news: false }).width; // 104
 */
function suitcase(panel: HTMLElement, each: RecapCase): { node: HTMLElement; width: number } {
  const node = element(
    'div',
    each.news ? 'aeroport-recap-case aeroport-recap-case--news' : 'aeroport-recap-case',
    panel,
  );
  node.dataset['part'] = 'recap-case';
  element('i', '', node);
  const tag = element('span', 'aeroport-recap-tag', node);
  tag.textContent = each.label;

  return { node, width: tag.offsetWidth + 8 };
}
