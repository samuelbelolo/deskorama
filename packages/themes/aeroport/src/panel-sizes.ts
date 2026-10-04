/** One size of the giant split-flap panel's cells, in pixels. */
interface PanelCell {
  readonly w: number;
  readonly h: number;
  readonly font: number;
  readonly gap: number;
}

/** One size of the giant panel: its cells and the box they make with its frame. */
export interface PanelSize {
  readonly cell: PanelCell;
  /** How many cells each line has: the longer line's length. */
  readonly cells: number;
  readonly w: number;
  readonly h: number;
}

/** The panel's cell sizes, largest first. */
const CELLS: readonly PanelCell[] = [
  { w: 28, h: 46, font: 40, gap: 2.5 },
  { w: 22, h: 36, font: 31, gap: 2 },
  { w: 16, h: 27, font: 23, gap: 1.5 },
  { w: 12, h: 20, font: 17, gap: 1 },
];

/** The panel's frame: its padding, the cobalt band on top, and the space between its two lines. */
const PAD = 16;
const BAND = 14;
const LINE_GAP = 10;

/**
 * Returns the sizes the giant panel can take for two lines, largest first, so a caller tries each in turn.
 * @example
 * panelSizes(['VOL ANNULÉ', 'PISTE FERMÉE'])[0]; // { cell: { w: 28, ... }, cells: 12, w: 398, h: 148 }
 */
export function panelSizes(lines: readonly [string, string]): readonly PanelSize[] {
  const cells = Math.max(...lines.map((line) => line.length));

  return CELLS.map((cell) => ({
    cell,
    cells,
    w: Math.round(cells * (cell.w + cell.gap) + PAD * 2),
    h: Math.round(cell.h * 2 + LINE_GAP + PAD * 2 + BAND),
  }));
}
