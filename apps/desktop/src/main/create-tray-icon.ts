import { nativeImage, type NativeImage } from 'electron';
import standard from './assets/tray-icon.png?inline';
import retina from './assets/tray-icon@2x.png?inline';

/**
 * Returns the menu-bar icon: a screen with a low sun on the horizon, as a template image so macOS tints it for a
 * light or dark menu bar. Both sizes are inlined into the bundle.
 * @example
 * new Tray(createTrayIcon());
 */
export function createTrayIcon(): NativeImage {
  const icon = nativeImage.createEmpty();
  icon.addRepresentation({ scaleFactor: 1, dataURL: standard });
  icon.addRepresentation({ scaleFactor: 2, dataURL: retina });
  icon.setTemplateImage(true);
  return icon;
}
