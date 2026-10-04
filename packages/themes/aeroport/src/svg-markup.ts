const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Returns the `<svg>` element written in `markup`. Only the Theme's own drawings go through here, built from
 * numbers and the Theme's own words escaped with `xmlText`: an Event string is never parsed as markup, it is set
 * afterwards through `textContent`.
 * @example
 * root.append(svgMarkup('<svg width="10" height="10"><rect class="hull" width="10" height="10"/></svg>'));
 */
export function svgMarkup(markup: string): SVGSVGElement {
  const source = markup.replace(/^\s*<svg\b/, `<svg xmlns="${SVG_NS}"`);
  const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');

  const svg = parsed.documentElement;
  if (!(svg instanceof SVGSVGElement)) throw new Error(`Not an SVG drawing: ${markup.slice(0, 60)}`);

  return document.importNode(svg, true);
}
