import { createFakeScreenHost, type FakeScreenHost, type FakeScreenHostOptions } from '@deskorama/test-utils';
import { createImmeuble } from '../src/create-immeuble.ts';

/** A mounted building: its layer, its fake host, and what unmounts it. */
export interface MountedBuilding {
  readonly layer: HTMLElement;
  readonly host: FakeScreenHost;
  readonly unmount: () => void;
}

/**
 * Mounts L'Immeuble on a fresh layer in the page, with a fake host. The caller unmounts it after the test.
 * @example
 * const { layer, host, unmount } = mountBuilding({ lang: 'en' });
 */
export function mountBuilding(options: FakeScreenHostOptions = {}): MountedBuilding {
  const layer = document.createElement('div');
  document.body.append(layer);
  const host = createFakeScreenHost(options);
  const unmount = createImmeuble().mount(layer, host);

  return { layer, host, unmount };
}
