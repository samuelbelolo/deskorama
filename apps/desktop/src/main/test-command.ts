import type { Language } from '@deskorama/core';

/** The Event the test command sends, in each language: a celebration from the terminal, with no apostrophe. */
const SAMPLE = {
  kind: 'terminal.test',
  archetype: 'celebration',
  source: 'Terminal',
  text: {
    fr: { label: 'Bonjour depuis le terminal', detail: 'Envoyé avec curl', tag: 'CURL' },
    en: { label: 'Hello from the terminal', detail: 'Sent with curl', tag: 'CURL' },
  },
};

/**
 * Returns a `curl` command that posts a test Event to the Local webhook, ready to paste in a terminal. The menu bar
 * copies it, so a script author sees the address, the secret header and the JSON shape in one line.
 * @example
 * testCommand(47213, 'f3a9…', 'en');
 * // curl http://127.0.0.1:47213/events -H 'Authorization: Bearer f3a9…' -H 'Content-Type: application/json' -d '{…}'
 */
export function testCommand(port: number, secret: string, lang: Language): string {
  const body = JSON.stringify({ ...SAMPLE, text: { [lang]: SAMPLE.text[lang] } });
  return [
    `curl http://127.0.0.1:${port}/events`,
    `-H 'Authorization: Bearer ${secret}'`,
    `-H 'Content-Type: application/json'`,
    `-d '${body}'`,
  ].join(' ');
}
