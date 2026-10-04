/**
 * Returns the pose of every part of the playing Gag (its transform and opacity), to compare two instants.
 * @example
 * gagPoses(layer); // ["translate(420.0px, 690.0px) 1.000", ...]
 */
export function gagPoses(layer: HTMLElement): string[] {
  return Array.from(layer.querySelectorAll<HTMLElement>('[data-gag]')).map(
    (node) => `${node.style.transform} ${node.style.opacity}`,
  );
}
