// The settings window's page: draws the window and hands it `window.settings`, the only way this sandboxed page
// reaches the main process.
import './styles/index.css';
import { mountSettingsWindow } from './mount-settings-window.ts';

const root = document.querySelector<HTMLElement>('#settings');

if (root === null) throw new Error('The settings page lacks #settings.');

await mountSettingsWindow(root, window.settings);
