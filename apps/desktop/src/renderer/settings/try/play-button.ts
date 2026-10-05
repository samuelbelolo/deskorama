import type { Clock } from '@deskorama/core';
import { element } from '../element.ts';
import { icon } from '../icon.ts';

/** How long the button stays pressed after a click, in milliseconds. */
const PRESSED_MS = 900;

/**
 * Returns a round play button, named for what it plays; it stays pressed for a moment, timed on `clock`, so the
 * click is felt even when the wallpaper is hidden behind the window.
 * @example
 * playButton('Play: Money', () => void bridge.playTest('money'), clock);
 */
export function playButton(label: string, play: () => void, clock: Clock): HTMLButtonElement {
  let release: (() => void) | null = null;

  const button = element(
    'button',
    {
      className: 'play',
      attributes: { type: 'button', 'aria-label': label, title: label },
      onClick: () => {
        play();

        // A second click while pressed starts the moment over.
        release?.();
        button.classList.add('just-played');
        release = clock.after(PRESSED_MS, () => button.classList.remove('just-played'));
      },
    },
    [icon('play-fill')],
  );

  return button;
}
