import type { Language } from '@deskorama/core';

/** What stands for the secret where the example is shown, so the secret itself stays off the screen. */
const SECRET_PLACEHOLDER = '$DESKORAMA_SECRET';

/** The fact the example Event states, in each language: a backup script that just finished. */
const LABEL: Readonly<Record<Language, string>> = { fr: 'Sauvegarde terminée', en: 'Backup finished' };

/**
 * Returns a one-line `curl` that posts an Event to the Local webhook, its body in the Event JSON format with only
 * the required fields and a Role. With `secret` null the line names the secret as `$DESKORAMA_SECRET` without
 * showing it; with a secret it carries it in single quotes, so the shell that receives the paste expands nothing
 * in it, whatever it holds. The body is spaced like hand-written JSON, so a narrow box wraps it between keys
 * rather than inside one.
 * @example
 * webhookExample('http://127.0.0.1:47213/events', null, 'en');
 * // curl http://127.0.0.1:47213/events -H "Authorization: Bearer $DESKORAMA_SECRET" -H "Content-Type: application/json"
 * //   -d '{"kind": "backup.done", "archetype": "approval", "source": "Mac", "text": {"en": {"label": "Backup finished"}}}'
 * webhookExample('http://127.0.0.1:47213/events', 'q7Zt…', 'en'); // … -H 'Authorization: Bearer q7Zt…' …
 */
export function webhookExample(address: string, secret: string | null, lang: Language): string {
  const event = { kind: 'backup.done', archetype: 'approval', source: 'Mac', text: { [lang]: { label: LABEL[lang] } } };

  const body = JSON.stringify(event).replaceAll('":', '": ').replaceAll(',"', ', "');

  const header = `Authorization: Bearer ${secret ?? SECRET_PLACEHOLDER}`;

  // In double quotes the shell puts the secret in place of its name; a secret itself is carried untouched.
  const authorization = secret === null ? `"${header}"` : shellLiteral(header);

  return [`curl ${address}`, `-H ${authorization}`, `-H "Content-Type: application/json"`, `-d '${body}'`].join(' ');
}

/**
 * Returns a text as one word a POSIX shell reads as it is: in single quotes, where nothing is expanded, each single
 * quote of the text closing them, standing escaped, and opening them again.
 * @example
 * shellLiteral('a $b `c`'); // "'a $b `c`'"
 * shellLiteral("it's"); // "'it'\\''s'", which a shell reads as it's
 */
function shellLiteral(text: string): string {
  return `'${text.replaceAll("'", String.raw`'\''`)}'`;
}
