// The demo page: a Theme on one fake screen, or two, under a fake desktop, fed by a fictional Source; a control
// panel picks the Source, the Theme, the language, the screens, the speed and the hour, and triggers any Event; an
// explanation and the download link follow.
import './styles.css';
import type { Language } from '@deskorama/core';
import { applyText } from './apply-text.ts';
import type { Choice } from './choice.ts';
import { createBrowserClock } from './create-browser-clock.ts';
import { createBrowserHost } from './create-browser-host.ts';
import { createDemoClock } from './create-demo-clock.ts';
import { createDemoScreens } from './create-demo-screens.ts';
import { demoScreens } from './demo-screens.ts';
import { DEMO_TEXT } from './demo-text.ts';
import { DEMO_THEMES } from './demo-themes.ts';
import { fitDesk } from './fit-desk.ts';
import { initialLanguage } from './initial-language.ts';
import { renderButtonGroup } from './render-button-group.ts';
import { renderOptions } from './render-options.ts';
import { renderTriggers } from './render-triggers.ts';
import { repositoryOf } from './repository-of.ts';
import { required } from './required.ts';
import { DEMO_SOURCES } from './sources/demo-sources.ts';
import { startSession } from './start-session.ts';
import { toggle } from './toggle.ts';
import { triggersOf } from './triggers-of.ts';

/** How many minutes of activity pass in a real minute, at each speed the visitor can pick. */
const SPEEDS = [1, 10, 60];

/** The hours the visitor can jump to: night, the morning rush, the afternoon, the evening. */
const HOURS = [3, 8, 14, 22];

const desk = required(document, '#desk', HTMLElement);
const sourcePicker = required(document, '#source', HTMLSelectElement);
const themePicker = required(document, '#theme', HTMLSelectElement);
const pitch = required(document, '#pitch', HTMLElement);
const speeds = required(document, '#speeds', HTMLElement);
const hours = required(document, '#hours', HTMLElement);
const triggers = required(document, '#triggers', HTMLElement);

const time = createDemoClock(createBrowserClock());
const host = createBrowserHost(
  demoScreens(false).map((display) => display.screen),
  time.clock,
);
const screens = createDemoScreens(desk, host);
const fit = fitDesk(required(document, '#frame', HTMLElement), desk);

let choice: Choice = {
  lang: initialLanguage(window.location.search, window.navigator.language),
  source: DEMO_SOURCES[0],
  theme: DEMO_THEMES[0],
  hour: 14,
};
let speed = 10;

time.setHour(choice.hour);

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

let session = startSession(host, choice, screens.layers, speed);

/**
 * Starts the scene again on a new choice. A new hour moves the Clock between the two scenes, never under a running
 * Gag, which reads the same Clock.
 * @example
 * restart({ ...choice, lang: 'en' }); // the same Source and Theme, every word now in English
 * restart({ ...choice, hour: 22 }); // the same scene, at 10 p.m.
 */
function restart(next: Choice): void {
  session.stop();
  if (next.hour !== choice.hour) time.setHour(next.hour);

  choice = next;
  session = startSession(host, choice, screens.layers, speed);
  renderPanel(choice.lang);
}

/**
 * Writes every word of the page and the panel's pickers, buttons and triggers in one language.
 * @example
 * renderPanel('fr'); // the page, the Source and Theme pickers, the speeds, hours and triggers, all in French
 */
function renderPanel(lang: Language): void {
  applyText(document, lang);

  const sources = DEMO_SOURCES.map((each) => ({ value: each.id, label: `${each.title[lang]} (${each.profile.name})` }));
  renderOptions(sourcePicker, sources, choice.source.id);
  pitch.textContent = choice.source.pitch[lang];

  const themes = DEMO_THEMES.map((each) => ({
    value: each.id,
    label: each.create === null ? `${each.name[lang]} (${DEMO_TEXT[lang].comingSoon})` : each.name[lang],
    disabled: each.create === null,
  }));
  renderOptions(themePicker, themes, choice.theme.id);

  renderButtonGroup(
    speeds,
    SPEEDS,
    (each) => `×${each}`,
    speed,
    (each) => {
      speed = each;
      session.simulator.setSpeed(each);
    },
  );

  renderButtonGroup(
    hours,
    HOURS,
    (each) => (lang === 'fr' ? `${each} h` : `${each}:00`),
    choice.hour,
    (each) => restart({ ...choice, hour: each }),
  );

  renderTriggers(triggers, triggersOf(choice.source), lang, (kind) => session.simulator.trigger(kind));
}

renderPanel(choice.lang);

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="lang"]')) {
  radio.checked = radio.value === choice.lang;
  radio.addEventListener('change', () => {
    if (radio.value === 'fr' || radio.value === 'en') restart({ ...choice, lang: radio.value });
  });
}

sourcePicker.addEventListener('change', () => {
  const source = DEMO_SOURCES.find((each) => each.id === sourcePicker.value);
  if (source !== undefined) restart({ ...choice, source });
});

themePicker.addEventListener('change', () => {
  const theme = DEMO_THEMES.find((each) => each.id === themePicker.value);
  if (theme?.create !== null && theme !== undefined) restart({ ...choice, theme });
});

toggle(required(document, '#pair', HTMLButtonElement), ['addScreen', 'removeScreen'], (two) => {
  showScreens(two);
  applyText(document, choice.lang);
});

toggle(required(document, '#cover', HTMLButtonElement), ['cover', 'uncover'], (covered) => {
  screens.setCovered(covered);
  applyText(document, choice.lang);
});

const repository = `https://github.com/${repositoryOf(new URL(window.location.href))}`;
required(document, '#download', HTMLAnchorElement).href = `${repository}/releases/latest`;
required(document, '#feed-link', HTMLAnchorElement).href = `${repository}/blob/main/docs/feed.md`;
