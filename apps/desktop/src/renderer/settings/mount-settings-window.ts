import type { Clock } from '@deskorama/core';
import type { SettingsBridge } from '../../shared/settings-bridge.ts';
import type { SettingsSnapshot } from '../../shared/settings-snapshot.ts';
import { createRendererClock } from '../create-renderer-clock.ts';
import { drawWindow } from './draw-window.ts';
import { createPaneHistory } from './pane-history.ts';
import { createSheetLayer } from './sheet-layer.ts';
import { sourceStanding } from './source-standing.ts';
import { closeSourceMenus } from './sources/close-source-menus.ts';
import { sourcesPane } from './sources/sources-pane.ts';
import { tryPane } from './try/try-pane.ts';
import { wallpaperPane } from './wallpaper/wallpaper-pane.ts';
import { webhookPane } from './webhook/webhook-pane.ts';
import { windowActions, type WindowContext } from './window-actions.ts';
import { buildWindowFrame, type WindowFrame } from './window-frame.ts';
import type { WindowActions, WindowView } from './window-view.ts';

/** How often the window says again how long ago an Event came, in milliseconds. */
const AGO_MS = 60_000;

/**
 * Draws the settings window into `root` and keeps it up to date, reaching the main process through `bridge` only,
 * and returns what removes it. It opens on the Sources when there is none yet or when one needs the person, on the
 * Wallpaper otherwise. Everything it shows about a service comes from the Connectors in the snapshot, and
 * everything about a Theme from the Theme's own package. Its timers run on `clock`, the page's own unless a test
 * passes one it can step.
 * @example
 * const unmount = await mountSettingsWindow(document.querySelector('#settings'), window.settings);
 */
export async function mountSettingsWindow(
  root: HTMLElement,
  bridge: SettingsBridge,
  clock: Clock = createRendererClock(),
): Promise<() => void> {
  const first = await bridge.load();

  const needsThePerson = first.sources.some((source) => sourceStanding(source.status, first.lang).kind === 'bad');
  const history = createPaneHistory(first.sources.length === 0 || needsThePerson ? 'sources' : 'wallpaper');

  let view: WindowView = {
    snapshot: first,
    pane: history.current(),
    time: matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day',
    secret: null,
    regenerateFailed: false,
    played: '',
  };

  /** Changes part of what the window shows without drawing it: the next drawing shows it. */
  const remember = (change: Partial<WindowView>): void => {
    view = { ...view, ...change };
  };

  /** Changes part of what the window shows, then draws it again. */
  const show = (change: Partial<WindowView>): void => {
    remember(change);
    drawWindow(frame, view, history, { content: paneContent(view, actions, bridge, clock), go: actions.go });
  };

  /** Moves through the pane history, then shows where it landed; what a pane said of a failure stays behind. */
  const travel = (move: () => void): void => {
    move();
    show({ pane: history.current(), regenerateFailed: false });
  };

  const frame = buildWindowFrame(root, {
    back: () => travel(() => history.back()),
    forward: () => travel(() => history.forward()),
  });

  const calm = followCalmly(root, frame, { show, remember });
  const sheets = createSheetLayer(frame.sheetLayer, [frame.sidebar, frame.content], () => calm.catchUp());

  const actions = windowActions({
    bridge,
    clock,
    sheets,
    view: () => view,
    show,
    remember,
    reload: async () => show({ snapshot: await bridge.load() }),
    visit: (pane) => travel(() => history.visit(pane)),
  });

  /** Says again how long ago each Event came, a minute later, for as long as the window is there. */
  const tick = (): void => {
    calm.follow({ ...view.snapshot, now: clock.now() });
    stopClock = clock.after(AGO_MS, tick);
  };

  let stopClock = clock.after(AGO_MS, tick);
  const stopFollowing = bridge.onChanged(calm.follow);

  show({});

  return () => {
    stopFollowing();
    stopClock();
    sheets.hide();
    calm.stop();
    root.replaceChildren();
  };
}

/**
 * Returns the content of the pane the window shows.
 * @example
 * paneContent({ ...view, pane: 'sources' }, actions, bridge, clock); // ["Connected", the list of Sources, …]
 */
function paneContent(view: WindowView, actions: WindowActions, bridge: SettingsBridge, clock: Clock): Node[] {
  const content = {
    sources: () => sourcesPane(view, actions),
    wallpaper: () => wallpaperPane(view, actions),
    try: () => tryPane(view, actions, bridge, clock),
    webhook: () => webhookPane(view, actions, bridge, clock),
  };

  return content[view.pane]();
}

/** How the window takes what the person did not ask for: a snapshot from the main process, a minute gone by. */
interface CalmFollower {
  /** Shows a snapshot nobody in the window asked for; while the person is busy it is only kept, to be shown later. */
  readonly follow: (snapshot: SettingsSnapshot) => void;
  /** Shows the snapshot kept while the person was busy, once they no longer are. */
  readonly catchUp: () => void;
  /** Stops listening to the window. */
  readonly stop: () => void;
}

/**
 * Returns how the window follows the snapshots it did not ask for without taking anything from under the person.
 * Drawing replaces the sidebar and the pane, which would close an open row menu or the list of a pop-up button, and
 * leave a sheet over a window that changed behind it: while one of those is up, a snapshot is only kept. A pop-up
 * button counts from the press that opens its list to the choice made, or to the keyboard leaving it. What was kept
 * is shown once the person is done, which a click, a key released, a choice made or a sheet closed may each mean;
 * never while the keyboard moves, since replacing the control under the pointer would lose the click that moved
 * it. A click anywhere also closes the row menus.
 * @example
 * const calm = followCalmly(root, frame, { show, remember });
 * bridge.onChanged(calm.follow); // a poll's new status waits while "Remove Tramlo?" is asked
 */
function followCalmly(
  root: HTMLElement,
  frame: WindowFrame,
  draw: Pick<WindowContext, 'show' | 'remember'>,
): CalmFollower {
  let choosing: HTMLSelectElement | null = null;
  let late = false;

  const busy = (): boolean =>
    !frame.sheetLayer.hidden || root.querySelector('.menu:not([hidden])') !== null || choosing?.isConnected === true;

  const catchUp = (): void => {
    if (!late || busy()) return;

    late = false;
    draw.show({});
  };

  const pressed = (event: Event): void => {
    if (event.target instanceof HTMLSelectElement) choosing = event.target;
  };

  const left = (): void => {
    choosing = null;
  };

  const chosen = (): void => {
    choosing = null;
    catchUp();
  };

  const clicked = (): void => {
    closeSourceMenus(root);
    catchUp();
  };

  root.addEventListener('pointerdown', pressed);
  root.addEventListener('keydown', pressed);
  root.addEventListener('focusout', left);
  root.addEventListener('change', chosen);
  root.addEventListener('click', clicked);
  root.addEventListener('keyup', catchUp);

  return {
    follow(snapshot) {
      // Drawn now, nothing is kept any more, whatever an earlier snapshot left waiting.
      late = busy();

      if (late) draw.remember({ snapshot });
      else draw.show({ snapshot });
    },

    catchUp,

    stop() {
      root.removeEventListener('pointerdown', pressed);
      root.removeEventListener('keydown', pressed);
      root.removeEventListener('focusout', left);
      root.removeEventListener('change', chosen);
      root.removeEventListener('click', clicked);
      root.removeEventListener('keyup', catchUp);
    },
  };
}
