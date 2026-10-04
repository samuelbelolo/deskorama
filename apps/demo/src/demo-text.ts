import type { Language } from '@deskorama/core';

/** The words of the demo page around the scene, of its control panel and of its fake desktop. */
export interface DemoText {
  readonly title: string;
  readonly intro: string;
  readonly panelTitle: string;
  readonly source: string;
  readonly theme: string;
  readonly comingSoon: string;
  readonly language: string;
  readonly speed: string;
  readonly speedHint: string;
  readonly hour: string;
  readonly addScreen: string;
  readonly removeScreen: string;
  readonly cover: string;
  readonly uncover: string;
  readonly trigger: string;
  readonly sceneLabel: string;
  readonly menu: string;
  readonly meeting: string;
  readonly hidden: string;
}

/** The demo page's words in every display language. */
export const DEMO_TEXT: Readonly<Record<Language, DemoText>> = {
  fr: {
    title: 'Deskorama',
    intro:
      'Un fond d’écran animé pour macOS qui réagit à vos systèmes. Choisissez une source inventée, déclenchez ses événements : chacun traverse le vrai moteur jusqu’à la scène, qui joue un gag avec sa légende. Déplacez les fenêtres : les gags ne jouent que là où le fond d’écran se voit.',
    panelTitle: 'Commandes',
    source: 'Source branchée',
    theme: 'Thème',
    comingSoon: 'bientôt',
    language: 'Langue',
    speed: 'Activité',
    speedHint: '×60 : une heure d’activité par minute. Le ciel garde son heure.',
    hour: 'Heure',
    addScreen: 'Ajouter un écran 16:9',
    removeScreen: 'Revenir à un écran',
    cover: 'Cacher le fond d’écran',
    uncover: 'Revenir au bureau',
    trigger: 'Déclencher un événement',
    sceneLabel: 'Bureau de démonstration',
    menu: 'Fichier   Édition   Présentation   Fenêtre',
    meeting: 'Réunion',
    hidden: 'Le fond d’écran est entièrement caché : la scène ne dessine plus rien.',
  },
  en: {
    title: 'Deskorama',
    intro:
      'An animated macOS wallpaper that reacts to your systems. Pick a made-up Source and trigger its events: each one travels through the real engine to the scene, which plays a gag with its caption. Drag the windows around: gags only play where the wallpaper shows.',
    panelTitle: 'Controls',
    source: 'Connected Source',
    theme: 'Theme',
    comingSoon: 'coming soon',
    language: 'Language',
    speed: 'Activity',
    speedHint: '×60: an hour of activity a minute. The sky keeps its hour.',
    hour: 'Time of day',
    addScreen: 'Add a 16:9 screen',
    removeScreen: 'Back to one screen',
    cover: 'Hide the wallpaper',
    uncover: 'Back to the desktop',
    trigger: 'Trigger an event',
    sceneLabel: 'Demo desktop',
    menu: 'File   Edit   View   Window',
    meeting: 'Meeting',
    hidden: 'The wallpaper is fully hidden: the scene stops drawing.',
  },
};
