import type { Language } from '@deskorama/core';
import type { SettingsText } from './settings-text.ts';
import { TEXT_EN } from './text-en.ts';
import { TEXT_FR } from './text-fr.ts';

/** The settings window's words in every display language. */
export const SETTINGS_TEXT: Readonly<Record<Language, SettingsText>> = { fr: TEXT_FR, en: TEXT_EN };
