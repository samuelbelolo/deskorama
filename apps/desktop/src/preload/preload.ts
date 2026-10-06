// The preload: exposes the narrow, typed bridge of `WallpaperBridge` to the renderer as `window.wallpaper`, and
// nothing else. The renderer never sees ipcRenderer, Node or Electron.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  DRAWN_CHANNEL,
  EVENT_CHANNEL,
  FRAMES_CHANNEL,
  RECAP_CHANNEL,
  SCENE_CHANNEL,
  SCREENS_CHANNEL,
  STATE_CHANNEL,
  type WallpaperBridge,
} from '../shared/wallpaper-bridge.ts';

/**
 * Calls `listener` with the payload of each message on one channel, until the returned function is called. The
 * payload's type is the one the bridge declares for that channel.
 * @example
 * const cancel = subscribe<WireEvent>(EVENT_CHANNEL, (event) => player.play(fromWireEvent(event)));
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- it types the payload the channel carries.
function subscribe<Payload>(channel: string, listener: (payload: Payload) => void): () => void {
  const forward = (_event: IpcRendererEvent, payload: Payload): void => listener(payload);

  ipcRenderer.on(channel, forward);

  return () => void ipcRenderer.off(channel, forward);
}

const bridge: WallpaperBridge = {
  onEvent: (listener) => subscribe(EVENT_CHANNEL, listener),
  onRecap: (listener) => subscribe(RECAP_CHANNEL, listener),
  onState: (listener) => subscribe(STATE_CHANNEL, listener),
  onWindowFrames: (listener) => subscribe(FRAMES_CHANNEL, listener),
  onScreens: (listener) => subscribe(SCREENS_CHANNEL, listener),
  onScene: (listener) => subscribe(SCENE_CHANNEL, listener),
  drawn: () => ipcRenderer.send(DRAWN_CHANNEL),
};

contextBridge.exposeInMainWorld('wallpaper', bridge);
