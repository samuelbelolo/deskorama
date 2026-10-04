/**
 * The building's styles: one canvas scaled up with hard pixels, and the mirror over it, whose transparent text sits
 * exactly on what the canvas paints so a screen reader reads the scene's words where they are drawn.
 */
export const STYLES = `
.immeuble-root {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  background: #262a45;
}

.immeuble-root canvas {
  position: absolute;
  left: 0;
  top: 0;
  image-rendering: pixelated;
}

.immeuble-mirror,
.immeuble-mirror > * {
  position: absolute;
  margin: 0;
  overflow: hidden;
  color: transparent;
  pointer-events: none;
}

.immeuble-mirror {
  inset: 0;
}

.immeuble-description {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
`;
