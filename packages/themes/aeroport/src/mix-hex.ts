/**
 * Returns the colour `share` of the way from `from` to `to`, both written `#rrggbb`.
 * @example
 * mixHex('#000000', '#ffffff', 0.5); // "#808080"
 * mixHex('#2d5da8', '#2d5da8', 0.3); // "#2d5da8"
 */
export function mixHex(from: string, to: string, share: number): string {
  const a = Number.parseInt(from.slice(1), 16);
  const b = Number.parseInt(to.slice(1), 16);

  const channel = (shift: number): string => {
    const value = Math.round(((a >> shift) & 255) * (1 - share) + ((b >> shift) & 255) * share);
    return value.toString(16).padStart(2, '0');
  };

  return `#${channel(16)}${channel(8)}${channel(0)}`;
}
