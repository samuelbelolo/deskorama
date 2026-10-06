import type { Cancel, Host } from '@deskorama/core';

/** The part of a window a fade drives. */
export interface FadingWindow {
  getOpacity(): number;
  setOpacity(opacity: number): void;
  isDestroyed(): boolean;
}

/** One fade: toward opaque (1) or toward transparent (0), and how long it takes. */
export interface Fade {
  readonly to: 0 | 1;
  readonly ms: number;
}

/** The fade that last drove each window: where it was going, and what stops it while it runs. */
const fades = new WeakMap<FadingWindow, { readonly to: 0 | 1; readonly stop: Cancel }>();

/**
 * Fades a window from the opacity it has now to fully opaque or fully transparent, slow at both ends, then calls
 * `done`; at once when the person asked the system to reduce motion. One fade drives a window at a time: a new one
 * takes over from the one running. A window that started fading out never fades back in, so a page that says its
 * scene is drawn while the app quits changes nothing; `done` is called all the same, as for a window closed
 * meanwhile.
 * @example
 * fadeWindow(window, host, { to: 1, ms: 400 }); // from transparent to opaque in 400 ms
 * fadeWindow(window, host, { to: 0, ms: 250 }, () => app.quit()); // from wherever it stands to transparent
 */
export function fadeWindow(
  window: FadingWindow,
  host: Pick<Host, 'clock' | 'reducedMotion'>,
  fade: Fade,
  done: () => void = () => {},
): void {
  const last = fades.get(window);

  if (window.isDestroyed() || (last?.to === 0 && fade.to === 1)) {
    done();

    return;
  }

  last?.stop();

  const from = window.getOpacity();
  const started = host.clock.now();

  /** Sets the opacity the fade has reached by now; returns true once it is over, or its window gone. */
  const step = (): boolean => {
    if (window.isDestroyed()) return true;

    const progress = host.reducedMotion ? 1 : Math.min(1, (host.clock.now() - started) / fade.ms);
    const eased = progress * progress * (3 - 2 * progress);

    window.setOpacity(from + (fade.to - from) * eased);

    return progress === 1;
  };

  if (step()) {
    fades.set(window, { to: fade.to, stop: () => {} });
    done();

    return;
  }

  const stop = host.clock.onFrame(() => {
    if (!step()) return;

    stop();
    done();
  });

  fades.set(window, { to: fade.to, stop });
}
