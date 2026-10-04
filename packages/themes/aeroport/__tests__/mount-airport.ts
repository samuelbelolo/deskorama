import { createFakeScreenHost, type FakeScreenHost, type FakeScreenHostOptions } from '@deskorama/test-utils';
import { createAeroport } from '../src/create-aeroport.ts';

/** A mounted airport: its layer, its fake host, and what unmounts it. */
export interface MountedAirport {
  readonly layer: HTMLElement;
  readonly host: FakeScreenHost;
  readonly unmount: () => void;
}

/**
 * Mounts L'Aéroport on a fresh layer in the page, with a fake host. The caller unmounts it after the test.
 * @example
 * const { layer, host, unmount } = mountAirport({ lang: 'en' });
 */
export function mountAirport(options: FakeScreenHostOptions = {}): MountedAirport {
  const layer = document.createElement('div');
  document.body.append(layer);
  const host = createFakeScreenHost(options);
  const unmount = createAeroport().mount(layer, host);

  return { layer, host, unmount };
}
