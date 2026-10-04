/**
 * Writes one line to the main process's standard error, where `log show` and a terminal launch can read it.
 * @example
 * writeLog('update', 'no update available'); // "[update] no update available"
 */
export function writeLog(topic: string, message: string): void {
  process.stderr.write(`[${topic}] ${message}\n`);
}
