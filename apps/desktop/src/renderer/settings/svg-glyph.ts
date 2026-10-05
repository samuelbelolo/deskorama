/** The namespace of SVG elements. */
const SVG = 'http://www.w3.org/2000/svg';

/**
 * Returns a decorative SVG of one path drawn in a square of `size` units, filled with the current text colour and
 * hidden from assistive technology: the text next to it says what it means.
 * @example
 * svgGlyph(24, 'M2 2h20v20H2z', 'logo'); // <svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path d="…"/></svg>
 */
export function svgGlyph(size: number, path: string, className: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  const shape = document.createElementNS(SVG, 'path');

  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  shape.setAttribute('d', path);
  svg.append(shape);

  return svg;
}
