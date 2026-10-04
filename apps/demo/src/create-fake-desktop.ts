import type { Rect, Screen } from '@deskorama/core';
import { clampWindow } from './clamp-window.ts';
import { coverOf } from './cover-of.ts';
import type { DesktopLayout, DesktopWindow } from './desktop-layouts.ts';
import { desktopOccluders } from './desktop-occluders.ts';
import { drawFakeWindow } from './draw-fake-window.ts';
import { makeDraggable } from './make-draggable.ts';
import { menuBarOf } from './menu-bar-of.ts';

/** How many apps the fake Dock shows. */
const DOCK_APPS = 7;

/** The fake macOS desktop drawn over one screen's scene. */
export interface FakeDesktop {
  /** Everything covering this screen's wallpaper right now, in the screen's pixels. */
  frames(): readonly Rect[];
  /** Shows or hides the meeting window that covers the whole wallpaper. */
  setCovered(covered: boolean): void;
}

/**
 * Draws the menu bar, the Dock and the draggable windows of `layout` over the scene of one fake screen, and calls
 * `changed` whenever a window moves or the wallpaper is covered or uncovered: the demo's stand-in for the desktop
 * app's window tracking. Raising a window keeps it under the meeting window, the menu bar and the Dock.
 * @example
 * const desktop = createFakeDesktop(stage, BUILTIN_SCREEN, BUILTIN_DESKTOP, () => publish());
 * desktop.setCovered(true);
 * desktop.frames().at(-1); // { x: 0, y: 25, w: 1440, h: 875 }: the meeting window
 */
export function createFakeDesktop(
  layer: HTMLElement,
  screen: Screen,
  layout: DesktopLayout,
  changed: () => void,
): FakeDesktop {
  let windows = layout.windows;
  let covered = false;

  const elements = new Map(windows.map((spec) => [spec.id, drawFakeWindow(spec)] as const));
  const cover = drawFakeWindow(coverOf(screen));
  // Back to front; z-indexes stay 1..n, below the meeting window and the bars.
  let order = windows.map((spec) => spec.id);

  const stack = (): void => {
    order.forEach((id, index) => {
      const element = elements.get(id);
      if (element !== undefined) element.style.zIndex = String(index + 1);
    });
  };

  const place = (spec: DesktopWindow): void => {
    const element = elements.get(spec.id);
    if (element !== undefined) pose(element, spec);
  };

  const move = (id: string, position: { x: number; y: number }): void => {
    windows = windows.map((spec) => (spec.id === id ? { ...spec, ...position } : spec));
    for (const spec of windows) place(spec);
    changed();
  };

  const scale = (): number => layer.getBoundingClientRect().width / screen.width;

  const chrome = document.createElement('div');
  chrome.className = 'desktop';
  chrome.append(drawMenuBar(menuBarOf(screen)));
  if (layout.dock !== null) chrome.append(drawDock(layout.dock));

  for (const spec of windows) {
    const element = elements.get(spec.id);
    const bar = element?.querySelector<HTMLElement>('.window-bar');
    if (element === undefined || bar === null || bar === undefined) continue;

    chrome.append(element);
    element.addEventListener('pointerdown', () => {
      order = [...order.filter((id) => id !== spec.id), spec.id];
      stack();
    });

    const position = (): { x: number; y: number } => windows.find((each) => each.id === spec.id) ?? spec;
    makeDraggable(bar, position, scale, (wanted) => move(spec.id, clampWindow(wanted, spec, screen)));
  }

  cover.hidden = true;
  pose(cover, coverOf(screen));
  chrome.append(cover);
  layer.append(chrome);

  for (const spec of windows) place(spec);
  stack();

  return {
    frames: () => desktopOccluders(screen, layout, windows, covered),
    setCovered(next) {
      covered = next;
      cover.hidden = !next;
      changed();
    },
  };
}

/**
 * Places an element at a rectangle of the fake screen.
 * @example
 * pose(cover, coverOf(BUILTIN_SCREEN)); // left 0, top 25, 1440 by 875
 */
function pose(element: HTMLElement, rect: Rect): void {
  Object.assign(element.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.w}px`,
    height: `${rect.h}px`,
  });
}

/**
 * Returns the fake menu bar; its words come from the page text.
 * @example
 * chrome.append(drawMenuBar(menuBarOf(BUILTIN_SCREEN))); // a 25 px bar reading "Fichier   Édition ..."
 */
function drawMenuBar(rect: Rect): HTMLElement {
  const bar = document.createElement('nav');
  bar.className = 'menubar';
  bar.style.cssText = `height:${rect.h}px`;
  bar.dataset['text'] = 'menu';
  return bar;
}

/**
 * Returns the fake Dock: a row of plain app tiles, no real app's icon.
 * @example
 * chrome.append(drawDock(DOCK)); // seven tiles centred at the bottom of the MacBook
 */
function drawDock(rect: Rect): HTMLElement {
  const dock = document.createElement('div');
  dock.className = 'dock';
  dock.style.cssText = `left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px`;
  dock.append(...Array.from({ length: DOCK_APPS }, () => document.createElement('i')));
  return dock;
}
