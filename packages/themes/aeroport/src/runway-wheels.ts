/**
 * Returns the line the PROD Caravelle's wheels roll on: the middle of the runway, for ground that ends at
 * `groundEnd`.
 * @example
 * runwayWheels(900); // 814
 */
export function runwayWheels(groundEnd: number): number {
  return groundEnd - 86;
}
