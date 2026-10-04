import type { DesktopWindow } from './desktop-layouts.ts';

/**
 * Returns the DOM of one fake window: a title bar to drag it by, and neutral placeholder content. The meeting
 * window's words come from the page text (`data-text`), so they follow the language switch.
 * @example
 * layer.append(drawFakeWindow(DESKTOP_WINDOWS[0]));
 */
export function drawFakeWindow(spec: DesktopWindow): HTMLElement {
  const element = document.createElement('section');
  element.className = `window window--${spec.kind}`;
  element.dataset['window'] = spec.id;
  const bar = document.createElement('header');
  bar.className = 'window-bar';
  const dots = document.createElement('span');
  dots.className = 'window-dots';
  dots.append(...['', '', ''].map(() => document.createElement('i')));
  const title = document.createElement('span');
  title.className = 'window-title';
  if (spec.kind === 'meeting') title.dataset['text'] = 'meeting';
  else title.textContent = spec.title;
  bar.append(dots, title);
  element.append(bar, body(spec));
  return element;
}

/**
 * Returns the inside of a fake window for its kind.
 * @example
 * body({ kind: 'terminal', ... }).textContent; // "~/tramlo $ pnpm test ..."
 */
function body(spec: DesktopWindow): HTMLElement {
  const content = document.createElement('div');
  content.className = 'window-body';
  if (spec.kind === 'terminal') {
    const prompt = document.createElement('pre');
    prompt.textContent = '~/tramlo $ pnpm test\n  ✓ 214 tests\n~/tramlo $ ▍';
    content.append(prompt);
  } else if (spec.kind === 'meeting') {
    const note = document.createElement('p');
    note.dataset['text'] = 'hidden';
    content.append(note);
  } else {
    content.append(...Array.from({ length: 9 }, () => document.createElement('i')));
  }
  return content;
}
