/** The stylesheet of the recap: the baggage claim panel, its title plate, the running belt and the tagged suitcases. */
export const RECAP_STYLES = `
.aeroport-recap { position: absolute; left: 0; top: 0; box-sizing: border-box; overflow: hidden; border-radius: 3px;
  background: color-mix(in srgb, var(--concrete) 94%, transparent); box-shadow: inset 0 0 0 2px var(--ink); }
.aeroport-recap-title { position: absolute; left: 10px; top: 8px; padding: 3px 10px 4px; background: var(--cobalt);
  color: var(--chalk); font: 600 16px/1.2 'Jost', sans-serif; border-radius: 2px; white-space: nowrap; z-index: 2; }
.aeroport-recap-title small { margin-left: 10px; font: 500 12px 'Jost', sans-serif; opacity: 0.85; }
.aeroport-recap-belt { position: absolute; left: 6px; right: 6px; height: 16px; overflow: hidden; background: var(--ink);
  border-radius: 8px; }
.aeroport-recap-rollers { position: absolute; top: 4px; bottom: 4px; left: 10px; right: -14px; will-change: transform;
  background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--chalk) 30%, transparent) 0 2px, transparent 2px 14px); }
.aeroport-recap-case { position: absolute; left: 0; top: 0; }
.aeroport-recap-case i { position: absolute; left: 0; top: 0; width: 28px; height: 21px; border-radius: 3px;
  box-shadow: inset 0 0 0 1.2px var(--ink); }
.aeroport-recap-tag { position: relative; display: inline-block; margin: 0 0 0 4px; padding: 1px 6px 2px;
  transform: translateY(-14px) rotate(-4deg); background: var(--chalk); color: var(--ink);
  font: 600 13px/1.2 'Jost', sans-serif; white-space: nowrap; box-shadow: 0 0 0 1.2px var(--ink); border-radius: 2px; }
.aeroport-recap-case--news .aeroport-recap-tag { color: var(--accent); box-shadow: 0 0 0 1.6px var(--accent); }
`;
