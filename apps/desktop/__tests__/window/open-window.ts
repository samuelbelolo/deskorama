import '../../src/renderer/settings/styles/index.css';
import { createFakeClock, type FakeClock } from '@deskorama/test-utils';
import { mountSettingsWindow } from '../../src/renderer/settings/mount-settings-window.ts';
import type { SettingsSnapshot } from '../../src/shared/settings-snapshot.ts';
import { fakeBridge, type FakeAnswers, type FakeBridge } from './fake-bridge.ts';

/** The settings window, drawn in the test page over a fake bridge. */
export interface OpenWindow extends FakeBridge {
  readonly root: HTMLElement;
  /** The window's Clock, which starts when the snapshot was taken and only moves when a test steps it. */
  readonly clock: FakeClock;
  /** The requests of one kind the window sent, each as its arguments. */
  readonly sent: (method: string) => unknown[][];
}

/**
 * Draws the settings window in the test page, at the size it opens at, over a fake bridge that starts on
 * `snapshot` and a fake Clock; a window left by an earlier test is replaced.
 * @example
 * const { root, sent } = await openWindow(emptySnapshot('en'));
 * sent('load'); // [[]]
 */
export async function openWindow(snapshot: SettingsSnapshot, answers: FakeAnswers = {}): Promise<OpenWindow> {
  const root = document.createElement('div');

  root.id = 'settings';
  root.style.height = '568px';

  document.body.style.margin = '0';
  document.body.replaceChildren(root);

  const fake = fakeBridge(snapshot, answers);
  const clock = createFakeClock(snapshot.now);

  await mountSettingsWindow(root, fake.bridge, clock);

  return {
    ...fake,
    root,
    clock,
    sent: (method) => fake.calls.filter(([name]) => name === method).map(([, ...payload]) => payload),
  };
}
