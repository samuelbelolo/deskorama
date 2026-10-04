// The demo page: L'Aéroport on one fake screen, or two, under a fake desktop; a button that sends a fictional Event,
// a button that adds the second screen, a button that hides the whole wallpaper, and a language switch.
import './styles.css';
import { applyText } from './apply-text.ts';
import { createBrowserHost } from './create-browser-host.ts';
import { createDemoScreens } from './create-demo-screens.ts';
import { demoScreens } from './demo-screens.ts';
import { fictionalEventAt } from './fictional-event-at.ts';
import { fitDesk } from './fit-desk.ts';
import { initialLanguage } from './initial-language.ts';
import { required } from './required.ts';
import { startSession } from './start-session.ts';
import { toggle } from './toggle.ts';

const send = required(document, '#send', HTMLButtonElement);
const pair = required(document, '#pair', HTMLButtonElement);
const cover = required(document, '#cover', HTMLButtonElement);
const desk = required(document, '#desk', HTMLElement);

const host = createBrowserHost(demoScreens(false).map((display) => display.screen));
const screens = createDemoScreens(desk, host);
const fit = fitDesk(required(document, '#frame', HTMLElement), desk);

let lang = initialLanguage(window.location.search, window.navigator.language);
let sent = 0;

/**
 * Shows the one-screen or two-screen desktop and scales it to the page.
 * @example
 * showScreens(true); // the MacBook and the 16:9 screen side by side
 */
function showScreens(two: boolean): void {
  const displays = demoScreens(two);
  screens.show(displays);
  fit.arrange(displays.map((display) => display.screen));
}

showScreens(false);

let session = startSession(host, lang, screens.layers);
applyText(document, lang);

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="lang"]')) {
  radio.checked = radio.value === lang;
  radio.addEventListener('change', () => {
    if (radio.value !== 'fr' && radio.value !== 'en') return;
    lang = radio.value;
    session.stop();
    session = startSession(host, lang, screens.layers);
    applyText(document, lang);
  });
}

send.addEventListener('click', () => {
  session.engine.send(fictionalEventAt(sent, host.clock.now()));
  sent += 1;
});

toggle(pair, ['addScreen', 'removeScreen'], (two) => {
  showScreens(two);
  applyText(document, lang);
});

toggle(cover, ['cover', 'uncover'], (covered) => {
  screens.setCovered(covered);
  applyText(document, lang);
});
