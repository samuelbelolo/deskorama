import type { Clock, SourceEvent } from '@deskorama/core';
import { toSourceEvent, validatePostedEvent } from '@deskorama/event-json';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readBody } from './read-body.ts';
import { MAX_BODY_BYTES, refuseRequestHead } from './refuse-request-head.ts';

/** What the request listener needs from the Local webhook. */
export interface RequestListenerOptions {
  /** The port the webhook listens on, known once it is bound. */
  readonly port: () => number;
  readonly secret: string;
  readonly clock: Clock;
  readonly onEvent: (event: SourceEvent) => void;
}

/**
 * Returns the HTTP listener of the Local webhook: it refuses a foreign host, a wrong path, method or secret, a
 * non-JSON or oversized body and an invalid Event, each with its own status, and answers 202 with the Event's id
 * once `onEvent` has it. It never throws: an unexpected failure answers 500.
 * @example
 * createServer(createRequestListener({ port: () => 4519, secret, clock, onEvent })).listen(4519, '127.0.0.1');
 */
export function createRequestListener(
  options: RequestListenerOptions,
): (request: IncomingMessage, response: ServerResponse) => void {
  let generated = 0;

  const handle = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const { headers } = request;

    const head = {
      method: request.method,
      path: request.url,
      host: headers.host,
      authorization: headers.authorization,
      contentType: headers['content-type'],
      contentLength: headers['content-length'],
    };

    const refusal = refuseRequestHead(head, options.port(), options.secret);
    if (refusal !== null) return answer(response, refusal.status, { error: refusal.error });

    const body = await readBody(request, MAX_BODY_BYTES);

    if (body === null) return answer(response, 413, { error: 'The body is too large.' });

    const json = parseJson(body);

    if (json === undefined) return answer(response, 400, { error: 'The body is not valid JSON.' });

    const validation = await validatePostedEvent(json);

    if (!validation.ok) return answer(response, 422, { error: 'The Event is not valid.', issues: validation.issues });

    const now = options.clock.now();
    const event = toSourceEvent(validation.event, now, `local-${now}-${generated++}`);

    options.onEvent(event);

    return answer(response, 202, { accepted: event.id });
  };

  return (request, response) => {
    handle(request, response).catch(() => answer(response, 500, { error: 'The Event could not be handled.' }));
  };
}

/**
 * Returns the parsed JSON of a body, or undefined when it is not JSON.
 * @example
 * parseJson('{"kind":"x"}'); // { kind: 'x' }
 * parseJson('kind=x'); // undefined
 */
function parseJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Sends a JSON answer and closes the connection, so a refused client cannot keep it open.
 * @example
 * answer(response, 202, { accepted: 'deploy-42' });
 */
function answer(response: ServerResponse, status: number, body: Readonly<Record<string, unknown>>): void {
  if (response.headersSent) return void response.end();
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', Connection: 'close' });
  response.end(JSON.stringify(body));
}
