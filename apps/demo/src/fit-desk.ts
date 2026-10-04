import type { Screen } from '@deskorama/core';
import { deskLeft } from './desk-left.ts';

/** Keeps the fake screens scaled to the width of their frame. */
export interface DeskFit {
  /** Lays the desk out for these screens and scales it again. */
  arrange(screens: readonly Screen[]): void;
}

/**
 * Scales the desk holding the fake screens to the width of its frame, keeping their proportions, now and whenever
 * the frame resizes or the screens change.
 * @example
 * const fit = fitDesk(frame, desk);
 * fit.arrange([BUILTIN_SCREEN, EXTERNAL_SCREEN]); // both screens side by side, scaled down to the frame
 */
export function fitDesk(frame: HTMLElement, desk: HTMLElement): DeskFit {
  let size = { width: 1, height: 1 };

  const fit = (): void => {
    const scale = frame.clientWidth / size.width;
    desk.style.transform = `scale(${scale})`;
    // The frame is border-box: its height carries its borders on top of the scaled desk.
    const borders = frame.offsetHeight - frame.clientHeight;
    frame.style.height = `${Math.round(size.height * scale) + borders}px`;
  };

  new ResizeObserver(fit).observe(frame);

  return {
    arrange(screens) {
      if (screens.length === 0) return;

      const right = Math.max(...screens.map((screen, index) => deskLeft(screen, index) + screen.width));
      const bottom = Math.max(...screens.map((screen) => screen.y + screen.height));

      size = { width: right, height: bottom };
      desk.style.width = `${size.width}px`;
      desk.style.height = `${size.height}px`;
      fit();
    },
  };
}
