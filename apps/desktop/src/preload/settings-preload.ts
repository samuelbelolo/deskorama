// The settings window's preload: exposes the narrow, typed bridge of `SettingsBridge` as `window.settings`, and
// nothing else. The page never sees ipcRenderer, Node or Electron.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { SETTINGS_CHANNELS, type SettingsBridge, type SettingsSnapshot } from '../shared/settings-bridge.ts';

const bridge: SettingsBridge = {
  load: () => ipcRenderer.invoke(SETTINGS_CHANNELS.load),
  save: (draft) => ipcRenderer.invoke(SETTINGS_CHANNELS.save, draft),
  remove: (id) => ipcRenderer.invoke(SETTINGS_CHANNELS.remove, id),
  test: (draft) => ipcRenderer.invoke(SETTINGS_CHANNELS.test, draft),
  onChanged(listener) {
    const forward = (_event: IpcRendererEvent, snapshot: SettingsSnapshot): void => listener(snapshot);

    ipcRenderer.on(SETTINGS_CHANNELS.changed, forward);

    return () => void ipcRenderer.off(SETTINGS_CHANNELS.changed, forward);
  },
};

contextBridge.exposeInMainWorld('settings', bridge);
