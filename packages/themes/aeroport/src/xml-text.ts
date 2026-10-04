/**
 * Returns one of the Theme's own words escaped for SVG markup, so an apostrophe or an ampersand in a painted word
 * cannot break the drawing.
 * @example
 * xmlText("POMPIERS DE L'AÉROPORT"); // "POMPIERS DE L&#39;AÉROPORT"
 */
export function xmlText(word: string): string {
  return word
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
