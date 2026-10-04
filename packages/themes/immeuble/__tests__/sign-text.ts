/**
 * Returns what a permanent sign reads right now, from the words mirrored over it; null when it is not shown.
 * @example
 * signText(layer, 'board'); // "SUR TRAMLO ACTIFS 9 COMMITS 23"
 */
export function signText(layer: HTMLElement, sign: string): string | null {
  return layer.querySelector(`[data-sign="${sign}"]`)?.textContent?.trim() ?? null;
}
