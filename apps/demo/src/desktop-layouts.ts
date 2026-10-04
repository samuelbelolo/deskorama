import type { Rect } from '@deskorama/core';

/** What a fake window shows inside: neutral placeholders, never real content. */
type WindowKind = 'editor' | 'terminal' | 'browser' | 'meeting';

/** One fake window of the demo desktop, in screen pixels. */
export interface DesktopWindow extends Rect {
  readonly id: string;
  readonly kind: WindowKind;
  /** The title bar's text: a file or an address on a reserved `.example` domain. */
  readonly title: string;
}

/** What one fake screen shows over its wallpaper besides the menu bar, in its own pixels. */
export interface DesktopLayout {
  /** The Dock, on the MacBook only, as on a real Mac with the Dock on the main display. */
  readonly dock: Rect | null;
  /** The windows it opens with, which the visitor can drag. */
  readonly windows: readonly DesktopWindow[];
}

/** The height of the menu bar across the top of every fake screen. */
export const MENU_BAR_HEIGHT = 25;

/** The Dock, centred at the bottom; narrow enough to leave the airport's signs their home on the grass. */
export const DOCK: Rect = { x: 520, y: 836, w: 400, h: 56 };

/** The windows the MacBook opens with, leaving the freight stand visible. */
export const DESKTOP_WINDOWS: readonly DesktopWindow[] = [
  { id: 'editor', kind: 'editor', title: 'scene.ts', x: 80, y: 60, w: 620, h: 400 },
  { id: 'terminal', kind: 'terminal', title: 'zsh', x: 980, y: 80, w: 400, h: 230 },
  { id: 'browser', kind: 'browser', title: 'app.tramlo.example', x: 780, y: 360, w: 520, h: 320 },
];

/** The MacBook's desktop. */
export const BUILTIN_DESKTOP: DesktopLayout = { dock: DOCK, windows: DESKTOP_WINDOWS };

/** The external screen's desktop: one documentation window, so more of its wallpaper shows. */
export const EXTERNAL_DESKTOP: DesktopLayout = {
  dock: null,
  windows: [{ id: 'docs', kind: 'browser', title: 'docs.tramlo.example', x: 60, y: 70, w: 760, h: 520 }],
};
