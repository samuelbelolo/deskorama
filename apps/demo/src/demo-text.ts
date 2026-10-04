import type { Language } from '@deskorama/core';

/** The words of the demo page around the scene, and of its fake desktop. */
export interface DemoText {
  readonly title: string;
  readonly intro: string;
  readonly send: string;
  readonly addScreen: string;
  readonly removeScreen: string;
  readonly cover: string;
  readonly uncover: string;
  readonly language: string;
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
      'Un fond d’écran animé qui réagit à vos systèmes. Envoyez un événement de Tramlo, un dépôt GitHub privé inventé : il traverse le moteur jusqu’à L’Aéroport. Déplacez les fenêtres : les gags ne jouent que là où le fond d’écran se voit. Avec deux écrans, chaque événement va sur l’un des deux, plus souvent sur le moins couvert ; les mises en ligne vont sur les deux.',
    send: 'Envoyer un événement',
    addScreen: 'Ajouter un écran 16:9',
    removeScreen: 'Revenir à un écran',
    cover: 'Cacher le fond d’écran',
    uncover: 'Revenir au bureau',
    language: 'Langue',
    sceneLabel: 'Bureau de démonstration',
    menu: 'Fichier   Édition   Présentation   Fenêtre',
    meeting: 'Réunion',
    hidden: 'Le fond d’écran est entièrement caché : la scène ne dessine plus rien.',
  },
  en: {
    title: 'Deskorama',
    intro:
      'An animated wallpaper that reacts to your systems. Send an event from Tramlo, a made-up private GitHub repository: it travels through the engine to L’Aéroport. Drag the windows around: gags only play where the wallpaper shows. With two screens, each event lands on one of them, more often on the less covered one; deploys land on both.',
    send: 'Send an event',
    addScreen: 'Add a 16:9 screen',
    removeScreen: 'Back to one screen',
    cover: 'Hide the wallpaper',
    uncover: 'Back to the desktop',
    language: 'Language',
    sceneLabel: 'Demo desktop',
    menu: 'File   Edit   View   Window',
    meeting: 'Meeting',
    hidden: 'The wallpaper is fully hidden: the scene stops drawing.',
  },
};
