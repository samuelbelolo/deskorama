import type { RecordedResponse, Responder } from '@deskorama/test-utils';

/** Every repository address starts with this. */
const API = 'https://api.github.com/repos/';

/**
 * Returns a responder that answers each request from `routes`, by its address after the repository's own, such
 * as `/pulls?…`, or `''` for the repository itself; a request it has no recording for fails the test.
 * @example
 * answerFrom('tramlo/tramlo-app', { '': recording('tramlo-app', 'repository.json') });
 */
export function answerFrom(repository: string, routes: Readonly<Record<string, RecordedResponse>>): Responder {
  const base = `${API}${repository}`;

  return (request) => {
    const route = request.url.startsWith(base) ? routes[request.url.slice(base.length)] : undefined;

    if (route === undefined) throw new Error(`No recording for ${request.url}`);

    return route;
  };
}
