import { request } from 'node:http';

/** What a test sends to the Local webhook; every field has a default that the webhook accepts. */
export interface PostOptions {
  readonly address?: string;
  readonly method?: string;
  readonly path?: string;
  readonly host?: string;
  readonly secret?: string | null;
  readonly contentType?: string;
}

/** The Local webhook's answer: its status and its JSON body. */
export interface Answer {
  readonly status: number;
  readonly body: Record<string, unknown>;
}

/**
 * Sends `body` to the Local webhook on `port` the way a local script would, with full control of the headers a
 * browser or `fetch` would not let a test forge (the `Host` header).
 * @example
 * await post(4519, JSON.stringify(event), { secret: SECRET }); // { status: 202, body: { accepted: '…' } }
 */
export function post(port: number, body: string, options: PostOptions = {}): Promise<Answer> {
  const address = options.address ?? '127.0.0.1';
  const headers: Record<string, string> = {
    host: options.host ?? `${address.includes(':') ? `[${address}]` : address}:${port}`,
    'content-type': options.contentType ?? 'application/json',
  };
  if (options.secret !== null && options.secret !== undefined) headers['authorization'] = `Bearer ${options.secret}`;
  return new Promise((resolve, reject) => {
    const outgoing = request(
      { host: address, port, method: options.method ?? 'POST', path: options.path ?? '/events', headers },
      (incoming) => {
        let text = '';
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk: string) => (text += chunk));
        incoming.on('end', () => resolve({ status: incoming.statusCode ?? 0, body: JSON.parse(text) }));
      },
    );
    outgoing.on('error', reject);
    outgoing.end(body);
  });
}
