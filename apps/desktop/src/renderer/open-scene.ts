import type { Cancel, ScreenPlayer, Theme } from '@deskorama/core';

/** A scene open on the page: the frame it draws in, and what takes it down. */
export interface OpenedScene {
  readonly frame: HTMLElement;
  /** Unmounts the Theme and removes its frame. */
  readonly close: Cancel;
}

/**
 * Mounts `theme` in a frame of its own that fills `layer`, over whatever scene is already there, so two scenes can
 * overlap while one takes over from the other.
 * @example
 * const opened = openScene(layer, player, themeFor('aeroport'));
 * opened.close(); // the scene and its frame are gone
 */
export function openScene(layer: HTMLElement, player: ScreenPlayer, theme: Theme<HTMLElement>): OpenedScene {
  const frame = document.createElement('div');
  frame.className = 'scene-frame';
  layer.append(frame);

  const unmount = player.mount(theme, frame);

  return {
    frame,
    close() {
      unmount();
      frame.remove();
    },
  };
}
