// The settings window's preload: exposes the narrow, typed bridge of `SettingsBridge` as `window.settings`, and
// nothing else. The page never sees ipcRenderer, Node or Electron.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { SETTINGS_CHANNELS, type SettingsBridge } from '../shared/settings-bridge.ts';
import type { SettingsSnapshot } from '../shared/settings-snapshot.ts';

const bridge: SettingsBridge = {
  load: () => ipcRenderer.invoke(SETTINGS_CHANNELS.load),
  save: (draft) => ipcRenderer.invoke(SETTINGS_CHANNELS.save, draft),
  remove: (id) => ipcRenderer.invoke(SETTINGS_CHANNELS.remove, id),
  test: (draft) => ipcRenderer.invoke(SETTINGS_CHANNELS.test, draft),
  listOptions: (draft, field) => ipcRenderer.invoke(SETTINGS_CHANNELS.listOptions, { draft, field }),
  setPreferences: (change) => ipcRenderer.invoke(SETTINGS_CHANNELS.preferences, change),
  setOpenAtLogin: (on) => ipcRenderer.invoke(SETTINGS_CHANNELS.openAtLogin, on),
  playTest: (choice) => ipcRenderer.invoke(SETTINGS_CHANNELS.playTest, choice),
  openTokenPage: (connector, values) => ipcRenderer.invoke(SETTINGS_CHANNELS.openTokenPage, { connector, values }),
  copy: (choice) => ipcRenderer.invoke(SETTINGS_CHANNELS.copy, choice),
  revealSecret: () => ipcRenderer.invoke(SETTINGS_CHANNELS.revealSecret),
  setWebhookOn: (on) => ipcRenderer.invoke(SETTINGS_CHANNELS.webhookOn, on),
  regenerateSecret: () => ipcRenderer.invoke(SETTINGS_CHANNELS.regenerateSecret),
  onChanged(listener) {
    const forward = (_event: IpcRendererEvent, snapshot: SettingsSnapshot): void => listener(snapshot);

    ipcRenderer.on(SETTINGS_CHANNELS.changed, forward);

    return () => void ipcRenderer.off(SETTINGS_CHANNELS.changed, forward);
  },
};

contextBridge.exposeInMainWorld('settings', bridge);
