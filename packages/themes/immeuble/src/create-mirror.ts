import type { Rect } from '@deskorama/core';

/** One element of the mirror: where it sits on the screen, and the words or the picture it stands for. */
interface MirrorEntry {
  /** In screen pixels. */
  readonly box: Rect;
  /** The `data-*` attributes it carries, e.g. `{ part: 'sign', sign: 'board' }`. */
  readonly data: Readonly<Record<string, string>>;
  /** Its words, each in its own span, in reading order. */
  readonly parts?: readonly (readonly [name: string, text: string])[];
}

/** The scene's words and pictures as transparent elements laid over the canvas: what a screen reader reads. */
export interface Mirror {
  /** Shows or updates the element of a key; returns what removes it. */
  set(key: string, entry: MirrorEntry): () => void;
  /** Removes every element. */
  clear(): void;
}

/**
 * Returns the mirror of one screen, appended to `root`. Each element is built from the same box the canvas draws in,
 * so its words sit where they are painted.
 * @example
 * const mirror = createMirror(root);
 * mirror.set('sign-board', { box: home, data: { part: 'sign', sign: 'board' }, parts: [['sign-text', 'SUR TRAMLO 9']] });
 */
export function createMirror(root: HTMLElement): Mirror {
  const layer = document.createElement('div');
  layer.className = 'immeuble-mirror';
  root.append(layer);
  const nodes = new Map<string, HTMLElement>();

  const remove = (key: string): void => {
    nodes.get(key)?.remove();
    nodes.delete(key);
  };

  return {
    set(key, entry) {
      const node = nodes.get(key) ?? document.createElement('div');
      node.replaceChildren();
      for (const name of Object.keys(node.dataset)) delete node.dataset[name];
      for (const [name, value] of Object.entries(entry.data)) node.dataset[name] = value;

      for (const [name, text] of entry.parts ?? []) {
        const span = document.createElement('span');
        span.dataset['part'] = name;
        span.textContent = `${text} `;
        node.append(span);
      }

      Object.assign(node.style, {
        left: `${entry.box.x}px`,
        top: `${entry.box.y}px`,
        width: `${entry.box.w}px`,
        height: `${entry.box.h}px`,
      });
      if (!nodes.has(key)) layer.append(node);
      nodes.set(key, node);

      return () => {
        if (nodes.get(key) === node) remove(key);
      };
    },
    clear() {
      for (const key of Array.from(nodes.keys())) remove(key);
    },
  };
}
