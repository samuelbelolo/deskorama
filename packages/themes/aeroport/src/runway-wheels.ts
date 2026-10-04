/**
 * Returns the line the PROD Caravelle's wheels roll on: the middle of the runway, for a screen `height` tall.
 * @example
 * runwayWheels(900); // 814
 */
export function runwayWheels(height: number): number {
  return height - 86;
}
