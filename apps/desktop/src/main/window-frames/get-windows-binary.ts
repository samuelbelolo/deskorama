import { join } from 'node:path';

/**
 * Returns the path of get-windows' macOS executable, which lists other apps' windows. The packaged app carries it
 * in its resources, outside the ASAR archive so it can run; a development run takes it from node_modules.
 * @example
 * getWindowsBinary({ isPackaged: true, resourcesPath: '/Applications/Deskorama.app/Contents/Resources', appPath: '' });
 * // "/Applications/Deskorama.app/Contents/Resources/get-windows"
 */
export function getWindowsBinary(app: { isPackaged: boolean; resourcesPath: string; appPath: string }): string {
  return app.isPackaged ? join(app.resourcesPath, 'get-windows') : join(app.appPath, 'node_modules/get-windows/main');
}
