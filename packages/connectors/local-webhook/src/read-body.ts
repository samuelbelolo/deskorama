import type { Readable } from 'node:stream';

/**
 * Reads a request body as UTF-8 text, or returns null once it grows past `limit` bytes. A body that is too large is
 * still drained, without being kept, so the refusal can be answered on the same connection.
 * @example
 * await readBody(request, 64 * 1024); // '{"kind":"deploy.done",…}'
 */
export function readBody(request: Readable, limit: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= limit) chunks.push(chunk);
    });
    request.on('end', () => resolve(size > limit ? null : Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}
