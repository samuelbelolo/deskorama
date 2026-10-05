import type { Clock } from '@deskorama/core';
import { icon } from '../icon.ts';
import { iconButton } from './icon-button.ts';

/** How long the button shows a check after copying, in milliseconds. */
const SHOWN_MS = 1400;

/**
 * Returns a button that runs `copy`, which puts something on the clipboard, and shows a check for a moment once it
 * has, timed on `clock`. The page has no clipboard access of its own, so `copy` asks the main process.
 * @example
 * copyButton('Copy', () => bridge.copy('webhook-address'), clock);
 */
export function copyButton(label: string, copy: () => Promise<void>, clock: Clock): HTMLButtonElement {
  const button = iconButton('copy', label, () => {
    copy().then(
      () => {
        button.replaceChildren(icon('check'));
        clock.after(SHOWN_MS, () => button.replaceChildren(icon('copy')));
      },
      // Nothing was copied, and there is nothing to draw again: the button keeps its glyph.
      () => {},
    );
  });

  return button;
}
