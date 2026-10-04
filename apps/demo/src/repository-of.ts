/** The repository the demo falls back to when it is not served from GitHub Pages, as on a local preview. */
const HOME_REPOSITORY = 'samuelbelolo/deskorama';

/**
 * Returns the GitHub repository, as "owner/name", whose Pages site serves the demo: so the download link follows the
 * repository wherever it lives, whatever it is called. A user site (owner.github.io) is its own repository.
 * @example
 * repositoryOf(new URL('https://octo.github.io/deskorama/')); // "octo/deskorama"
 * repositoryOf(new URL('https://octo.github.io/index.html')); // "octo/octo.github.io"
 * repositoryOf(new URL('http://localhost:4173/')); // "samuelbelolo/deskorama"
 */
export function repositoryOf(location: URL): string {
  const pages = /^([^.]+)\.github\.io$/i.exec(location.hostname);
  if (pages === null) return HOME_REPOSITORY;

  const owner = pages[1] ?? '';
  const name = location.pathname.split('/').find((segment) => segment !== '' && !segment.endsWith('.html'));

  return `${owner}/${name ?? `${owner}.github.io`}`;
}
