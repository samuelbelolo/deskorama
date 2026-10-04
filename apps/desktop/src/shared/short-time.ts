import type { Language } from '@deskorama/core';

/**
 * Returns the hour and minute of an instant, the way the menu bar and the settings window show it.
 * @example
 * shortTime(Date.UTC(2026, 9, 4, 13, 58), 'fr'); // "15:58" in Paris
 */
export function shortTime(at: number, lang: Language): string {
  return new Date(at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
}
