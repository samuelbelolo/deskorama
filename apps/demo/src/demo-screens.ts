import type { Screen } from '@deskorama/core';
import { BUILTIN_DESKTOP, EXTERNAL_DESKTOP, type DesktopLayout } from './desktop-layouts.ts';

/** One fake screen of the demo and the desktop drawn on it. */
export interface DemoScreen {
  readonly screen: Screen;
  readonly layout: DesktopLayout;
}

/** The demo's first screen: a 16:10 MacBook at the desktop's origin. */
export const BUILTIN_SCREEN: Screen = { id: 'builtin', x: 0, y: 0, width: 1440, height: 900 };

/** The demo's second screen: a 16:9 external display right of the MacBook, top edges aligned. */
export const EXTERNAL_SCREEN: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };

/**
 * Returns the screens of the demo's one-screen or two-screen mode, left to right, each with its desktop.
 * @example
 * demoScreens(false).map((each) => each.screen.id); // ["builtin"]
 * demoScreens(true).map((each) => each.screen.id); // ["builtin", "external"]
 */
export function demoScreens(two: boolean): readonly DemoScreen[] {
  const builtin = { screen: BUILTIN_SCREEN, layout: BUILTIN_DESKTOP };
  return two ? [builtin, { screen: EXTERNAL_SCREEN, layout: EXTERNAL_DESKTOP }] : [builtin];
}
