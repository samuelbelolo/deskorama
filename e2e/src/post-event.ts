/**
 * Posts one Event to the Local webhook the way a local script does, and returns the HTTP status.
 * @example
 * await postEvent(47299, secret, { kind: 'deploy.done', source: 'Tramlo CI', text: { en: { label: 'Deployed' } } }); // 202
 */
export async function postEvent(
  port: number,
  secret: string,
  event: Readonly<Record<string, unknown>>,
): Promise<number> {
  const response = await fetch(`http://127.0.0.1:${port}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return response.status;
}
