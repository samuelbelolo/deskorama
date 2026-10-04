import type { Layout } from './layout.ts';
import type { Strings } from './strings.ts';
import { svgMarkup } from './svg-markup.ts';

/** The board's frame and where its flaps go. */
export interface BoardFrame {
  readonly node: HTMLElement;
  /** Where the runway state's flaps go, in the title band. */
  readonly runway: HTMLElement;
  /** Where the rows go, under the column heads. */
  readonly rows: HTMLElement;
}

/**
 * Draws the Departures board's frame: the lattice pylons down to the hangar, the ink panel with its cobalt title
 * band painted with the title and the runway's name, and the column heads. The flaps are added by the caller.
 * @example
 * const frame = drawBoardFrame(root, layoutFor(host.screen), textFor('fr'));
 * frame.runway.append(runwayField.node);
 */
export function drawBoardFrame(root: HTMLElement, layout: Layout, text: Strings): BoardFrame {
  const { x, y, w, h } = layout.board;
  const legTop = y + h;
  const legBottom = layout.hangar.y + 6;

  const pylons = document.createElement('div');
  pylons.className = 'aeroport-fixture';
  pylons.dataset['part'] = 'board-pylons';
  pylons.append(
    svgMarkup(`<svg width="${x + w}" height="${legBottom}" viewBox="0 0 ${x + w} ${legBottom}">
      ${[x + 70, x + w - 70].map((lx) => lattice(lx, legTop, legBottom)).join('')}
    </svg>`),
  );

  const node = document.createElement('div');
  node.className = 'aeroport-board';
  node.dataset['part'] = 'board';
  node.style.transform = `translate(${x}px, ${y}px)`;
  node.style.width = `${w}px`;
  node.style.height = `${h}px`;

  const band = element('div', 'aeroport-board-band', node);
  element('span', 'aeroport-board-title', band).textContent = text.board.title;
  const runwayLine = element('span', 'aeroport-board-runway', band);
  element('span', 'aeroport-board-runway-name', runwayLine).textContent = text.board.runway;
  const runway = element('span', '', runwayLine);

  const heads = element('div', 'aeroport-board-heads', node);
  for (const column of text.board.columns) element('span', '', heads).textContent = column;

  const rows = element('div', 'aeroport-board-rows', node);

  const both = document.createElement('div');
  both.dataset['part'] = 'board-frame';
  both.append(pylons, node);
  root.append(both);

  return { node: both, runway, rows };
}

/**
 * Returns one lattice pylon from the board down to the hangar roof.
 * @example
 * lattice(940, 280, 542).includes('pylon'); // true
 */
function lattice(x: number, top: number, bottom: number): string {
  let braces = '';
  for (let y = top; y < bottom - 20; y += 22)
    braces += `M${x},${y} L${x + 14},${y + 22} M${x + 14},${y} L${x},${y + 22} `;

  return `<rect class="pylon" x="${x - 1}" y="${top}" width="3" height="${bottom - top}"/>
    <rect class="pylon" x="${x + 13}" y="${top}" width="3" height="${bottom - top}"/>
    <path class="pylon-brace" d="${braces}"/>`;
}

/**
 * Returns a new element with a class, appended to `parent`.
 * @example
 * element('span', 'aeroport-board-title', band).textContent = 'Départs';
 */
function element(tag: string, className: string, parent: HTMLElement): HTMLElement {
  const node = document.createElement(tag);
  if (className !== '') node.className = className;
  parent.append(node);

  return node;
}
