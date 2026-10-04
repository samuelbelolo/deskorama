import type { Screen, ScreenLayers } from '@deskorama/core';
import type { BrowserHost } from './create-browser-host.ts';
import { createFakeDesktop, type FakeDesktop } from './create-fake-desktop.ts';
import type { DemoScreen } from './demo-screens.ts';
import { deskLeft } from './desk-left.ts';
import { toDesktopFrames } from './to-desktop-frames.ts';

/** One fake screen on the page: its scene for the Theme and its fake desktop on top. */
interface Stage {
  readonly screen: Screen;
  readonly element: HTMLElement;
  readonly scene: HTMLElement;
  readonly desktop: FakeDesktop;
}

/** The fake screens of the demo, which outlive an engine session so a language switch keeps the windows in place. */
export interface DemoScreens {
  /** The scene of each fake screen, for the engine to mount a Theme instance on. */
  readonly layers: ScreenLayers<HTMLElement>;
  /** Shows exactly these screens, plugging or unplugging them on the Host. */
  show(screens: readonly DemoScreen[]): void;
  /** Shows or hides the window that covers the whole wallpaper, on every screen at once. */
  setCovered(covered: boolean): void;
}

/**
 * Returns the demo's fake screens, drawn side by side in `desk`. Their windows reach the Host in desktop coordinates,
 * so the engine sees one desktop spanning every screen.
 * @example
 * const screens = createDemoScreens(desk, host);
 * screens.show(demoScreens(true));
 * host.screens().length; // 2
 */
export function createDemoScreens(desk: HTMLElement, host: BrowserHost): DemoScreens {
  const stages = new Map<string, Stage>();
  let covered = false;
  // While several desktops change together, they report once at the end, so the engine never sees half of it.
  let batching = false;

  const publish = (): void => {
    if (batching) return;

    const all = Array.from(stages.values(), (stage) => toDesktopFrames(stage.screen, stage.desktop.frames()));
    host.setWindowFrames(all.flat());
  };

  const together = (change: () => void): void => {
    batching = true;
    change();
    batching = false;
    publish();
  };

  const open = ({ screen, layout }: DemoScreen, index: number): void => {
    const element = document.createElement('div');
    element.className = 'screen';
    element.dataset['screen'] = screen.id;
    element.style.cssText = `left:${deskLeft(screen, index)}px;width:${screen.width}px;height:${screen.height}px`;

    const scene = document.createElement('div');
    scene.className = 'scene';
    element.append(scene);
    desk.append(element);

    const desktop = createFakeDesktop(element, screen, layout, publish);
    stages.set(screen.id, { screen, element, scene, desktop });
    desktop.setCovered(covered);
  };

  return {
    layers: {
      open(screen) {
        const stage = stages.get(screen.id);
        if (stage === undefined) throw new Error(`The demo has no fake screen ${screen.id}.`);
        return stage.scene;
      },
      close: (_screen, layer) => layer.replaceChildren(),
    },
    show(displays) {
      // A new screen's windows reach the Host before the screen does, so its view starts from them.
      together(() => {
        displays.forEach((display, index) => {
          if (!stages.has(display.screen.id)) open(display, index);
        });
      });

      // The engine unmounts a leaving screen's Theme before its stage goes.
      host.setScreens(displays.map((display) => display.screen));

      for (const stage of Array.from(stages.values())) {
        if (displays.some((display) => display.screen.id === stage.screen.id)) continue;
        stage.element.remove();
        stages.delete(stage.screen.id);
      }

      publish();
    },
    setCovered(next) {
      covered = next;
      together(() => {
        for (const stage of stages.values()) stage.desktop.setCovered(next);
      });
    },
  };
}
