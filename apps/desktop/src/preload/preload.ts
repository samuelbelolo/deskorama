// The preload: exposes the narrow, typed bridge of `WallpaperBridge` to the renderer as `window.wallpaper`, and
// nothing else. The renderer never sees ipcRenderer, Node or Electron.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { EVENT_CHANNEL, FRAMES_CHANNEL, type WallpaperBridge } from '../shared/wallpaper-bridge.ts';

/**
 * Calls `listener` with the payload of each message on one channel, until the returned function is called. The
 * payload's type is the one the bridge declares for that channel.
 * @example
 * const cancel = subscribe<WireEvent>(EVENT_CHANNEL, (event) => engine.send(fromWireEvent(event)));
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- it types the payload the channel carries.
function subscribe<Payload>(channel: string, listener: (payload: Payload) => void): () => void {
  const forward = (_event: IpcRendererEvent, payload: Payload): void => listener(payload);

  ipcRenderer.on(channel, forward);

  return () => void ipcRenderer.off(channel, forward);
}

const bridge: WallpaperBridge = {
  onEvent: (listener) => subscribe(EVENT_CHANNEL, listener),
  onWindowFrames: (listener) => subscribe(FRAMES_CHANNEL, listener),
};

contextBridge.exposeInMainWorld('wallpaper', bridge);
