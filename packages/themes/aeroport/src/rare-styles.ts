/**
 * The stylesheet of the rare scenes: the PROD flight's painted name and the cargo door, the golden jet and its hearts
 * (the only gold on the poster), the fire truck, the foam and the tow tug, the slate dim and the giant split-flap
 * panel of a failed deploy, and the tower's bubble hung under its cab.
 */
export const RARE_STYLES = `
.aeroport-root .plane-name { fill: var(--accent); font: italic 600 12px 'Jost', sans-serif; }
.aeroport-root .plane-sub { fill: var(--cobalt); font: 600 5.4px 'Jost', sans-serif; letter-spacing: 0.4px; }
.aeroport-root .cargo-door { fill: none; stroke: var(--ink); stroke-width: 0.8; opacity: 0.55; }
.aeroport-root .gold { fill: var(--gold); }
.aeroport-root .gold-dark { fill: color-mix(in srgb, var(--gold) 70%, var(--ink)); }
.aeroport-root .gold-light { fill: color-mix(in srgb, var(--gold) 55%, var(--chalk)); }
.aeroport-root .jet-window { fill: var(--ink); opacity: 0.7; }
.aeroport-root .jet-heart { fill: var(--accent); }
.aeroport-root .jet-wing-hi { fill: none; stroke: color-mix(in srgb, var(--gold) 45%, var(--chalk)); stroke-width: 1.4;
  stroke-linecap: round; }
.aeroport-root .gold-trail, .aeroport-root .tarmac-heart { fill: none; stroke: var(--gold); stroke-linecap: round;
  stroke-linejoin: round; stroke-dasharray: 1; }
.aeroport-root .gold-trail { stroke-width: 7; }
.aeroport-root .tarmac-heart { stroke-width: 6; }
.aeroport-root .heart-tag { fill: var(--gold); stroke: var(--chalk); stroke-width: 3; paint-order: stroke;
  font: 700 26px 'Barlow Condensed', sans-serif; letter-spacing: 1px; }
.aeroport-root .carpet { fill: var(--accent); } .aeroport-root .carpet-edge { fill: var(--chalk); opacity: 0.8; }
.aeroport-root .truck-body { fill: var(--accent); }
.aeroport-root .truck-window { fill: var(--ink); opacity: 0.8; }
.aeroport-root .truck-stripe { fill: var(--chalk); }
.aeroport-root .truck-text { fill: var(--chalk); font: 700 9px 'Jost', sans-serif; letter-spacing: 1.4px; }
.aeroport-root .truck-bar, .aeroport-root .truck-turret, .aeroport-root .truck-nozzle, .aeroport-root .tow-bar { fill: var(--ink); }
.aeroport-root .truck-ladder, .aeroport-root .hub { fill: var(--concrete); }
.aeroport-root .truck-light { fill: var(--chalk); }
.aeroport-root [data-lights='a'] .light-a, .aeroport-root [data-lights='b'] .light-b,
.aeroport-root [data-lights='both'] .truck-light { fill: var(--accent); }
.aeroport-root .foam, .aeroport-root .spray { fill: var(--chalk); }
.aeroport-root .foam { stroke: color-mix(in srgb, var(--chalk) 60%, var(--ink)); stroke-width: 0.8; }
.aeroport-slate { position: absolute; inset: 0; pointer-events: none; }
.aeroport-big-panel { position: absolute; left: 0; top: 0; box-sizing: border-box; display: grid; align-content: center;
  gap: 10px; padding: 26px 16px 16px; background: var(--ink); border-radius: 3px; box-shadow: inset 0 0 0 3px var(--accent); }
.aeroport-big-panel::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 14px;
  background: var(--accent); border-radius: 3px 3px 0 0; }
.aeroport-big-panel .aeroport-flaps { gap: var(--cell-gap); }
.aeroport-big-panel .aeroport-flap { flex: 0 0 var(--cell-w); height: var(--cell-h); font-size: var(--cell-font);
  line-height: var(--cell-h); }
.aeroport-bubble--below::after { top: -7px; bottom: auto; clip-path: polygon(30% 0, 100% 100%, 0 100%); }
`;
