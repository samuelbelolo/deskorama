/**
 * Marks a node as part of one of the airport's own scenes (the PROD flight, the failed deploy) rather than of the Gag
 * the director plays, so it never counts as that Gag. Returns the node.
 * @example
 * markScene(bubble.node).dataset['scene']; // ""
 */
export function markScene<Node extends HTMLElement>(node: Node): Node {
  delete node.dataset['gag'];
  node.dataset['scene'] = '';

  return node;
}
