import type { SignLine } from '../src/sign-line.ts';
import { textCells } from '../src/text-cells.ts';

/**
 * Returns the lines whose accent touches another line: an accent pixel with a painted pixel of another line in one
 * of its eight neighbours, so no free pixel keeps it with its own letter. Empty when every accent is clear.
 * @example
 * accentClashes([{ text: 'MISE', y: 0, ... }, { text: 'RÉUSSIE', y: 7, ... }]); // ["RÉUSSIE"]: 2 pixels short
 */
export function accentClashes(lines: readonly SignLine[]): string[] {
  const painted = lines.map((line) => pixels(line, 'body').concat(pixels(line, 'marks')));
  const clashes: string[] = [];

  lines.forEach((line, i) => {
    const others = new Set(painted.flatMap((set, j) => (j === i ? [] : set)));
    const touches = pixels(line, 'marks').some((key) => {
      const [x = 0, y = 0] = key.split(',').map(Number);
      for (let dx = -1; dx <= 1; dx += 1)
        for (let dy = -1; dy <= 1; dy += 1) if (others.has(`${x + dx},${y + dy}`)) return true;
      return false;
    });
    if (touches) clashes.push(line.text);
  });

  return clashes;
}

/**
 * Returns every pixel a line paints for its letters or its accents, as "x,y" keys.
 * @example
 * pixels({ text: 'É', x: 0, y: 10, scale: 1, colour: '#000' }, 'marks'); // ["2,7", "1,8"]
 */
function pixels(line: SignLine, part: 'body' | 'marks'): string[] {
  const cells = textCells(line.text, line.x, line.y, line.scale)[part];

  return cells.flatMap((cell) => {
    const keys: string[] = [];
    for (let dx = 0; dx < line.scale; dx += 1)
      for (let dy = 0; dy < line.scale; dy += 1) keys.push(`${cell.x + dx},${cell.y + dy}`);
    return keys;
  });
}
