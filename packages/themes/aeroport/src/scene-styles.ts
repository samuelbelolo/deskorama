/**
 * The poster's stylesheet: tints that follow the hour (custom properties written on the root), the night lights,
 * the tower's poses, the airfield's fire station, and the closed runway. Every rule is scoped to the Theme's root.
 */
export const SCENE_STYLES = `
.aeroport-root .t-sky1 { fill: var(--sky1); } .aeroport-root .t-sky2 { fill: var(--sky2); }
.aeroport-root .t-sky3 { fill: var(--sky3); } .aeroport-root .t-sky4 { fill: var(--sky4); }
.aeroport-root .t-far { fill: var(--far); }
.aeroport-root .t-far-dark { fill: color-mix(in srgb, var(--far) 70%, var(--ink)); }
.aeroport-root .t-apron { fill: var(--apron); } .aeroport-root .t-tarmac { fill: var(--tarmac); }
.aeroport-root .t-grass { fill: var(--grass); } .aeroport-root .t-facade { fill: var(--facade); }
.aeroport-root .t-glass { fill: var(--glass); }
.aeroport-root .t-plinth { fill: color-mix(in srgb, var(--facade) 80%, var(--ink)); }
.aeroport-root .cloud { fill: var(--cloud); }
.aeroport-root .stars { fill: var(--chalk); opacity: 0; }
.aeroport-root.is-night .stars { opacity: 0.85; }
.aeroport-root .sun-disc { fill: var(--sun); }
.aeroport-root .sun-halo { fill: var(--sun); opacity: 0.35; }
.aeroport-root .moon-disc { fill: var(--sun); } .aeroport-root .moon-bite { fill: var(--sky2); }
.aeroport-root .roof-small { fill: var(--ink); font: 600 18px 'Jost', 'Futura', sans-serif; letter-spacing: 0.08em; }
.aeroport-root .roof-name { fill: var(--ink); font: 700 44px 'Jost', 'Futura', sans-serif; letter-spacing: 0.06em; }
.aeroport-root.is-night .roof-name, .aeroport-root.is-night .roof-small { fill: var(--lit); }
.aeroport-root .facade-text, .aeroport-root .tower-text, .aeroport-root .hangar-text {
  fill: var(--ink); font: 600 11px 'Jost', 'Futura', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; }
.aeroport-root .mullion { fill: var(--ink); opacity: 0.55; }
.aeroport-root .glass-glint { fill: var(--chalk); opacity: 0.18; }
.aeroport-root .night-lamp { fill: var(--lit); opacity: 0; }
.aeroport-root.is-night .night-lamp, .aeroport-root.is-dusk .night-lamp { opacity: 0.55; }
.aeroport-root .slab-shadow { fill: var(--ink); opacity: 0.25; }
.aeroport-root .door { fill: var(--ink); opacity: 0.8; }
.aeroport-root .door-plate { fill: var(--cobalt); }
.aeroport-root .door-text { fill: var(--chalk); font: 600 6.4px 'Jost', sans-serif; letter-spacing: 0.4px; }
.aeroport-root .hangar-door { fill: color-mix(in srgb, var(--facade) 75%, var(--ink)); }
.aeroport-root .hangar-seam { fill: var(--ink); opacity: 0.25; }
.aeroport-root .roof-ribs { fill: none; stroke: var(--ink); stroke-width: 1.2; opacity: 0.3; }
.aeroport-root .mast, .aeroport-root .console, .aeroport-root .cab-sill { fill: var(--ink); }
.aeroport-root .beacon { fill: var(--chalk); }
.aeroport-root .beam { fill: var(--lit); opacity: 0; }
.aeroport-root[data-build='building'] .beacon { fill: var(--lit); }
.aeroport-root[data-build='building'] .beam { opacity: 0.45; }
.aeroport-root .tower-stripe { fill: var(--cobalt); }
.aeroport-root .tower-slit { fill: var(--ink); opacity: 0.6; }
.aeroport-root .cab-frame { fill: none; stroke: var(--cobalt); stroke-width: 3; }
.aeroport-root .skin { fill: #e8c3a4; } .aeroport-root .uniform { fill: var(--cobalt); }
.aeroport-root .cap, .aeroport-root .binoculars { fill: var(--ink); }
.aeroport-root .arm { stroke: var(--cobalt); stroke-width: 3; stroke-linecap: round; }
.aeroport-root .zz { fill: var(--chalk); font: 700 10px 'Jost', sans-serif; }
.aeroport-root .zz-big { font-size: 15px; }
.aeroport-root .lamp { fill: var(--lit); }
.aeroport-root .pose { display: none; }
.aeroport-root[data-pose='idle'] .pose-idle, .aeroport-root[data-pose='watch'] .pose-watch,
.aeroport-root[data-pose='sleep'] .pose-sleep { display: inline; }
.aeroport-root .apron-paint { fill: none; stroke: var(--lit); stroke-width: 2; opacity: 0.8; }
.aeroport-root .chalk-paint { fill: var(--chalk); opacity: 0.9; }
.aeroport-root .runway-number { fill: var(--chalk); font: 700 64px 'Jost', sans-serif; opacity: 0.9; }
.aeroport-root .tuft { fill: none; stroke: color-mix(in srgb, var(--grass) 60%, var(--ink)); stroke-width: 1.2; }
.aeroport-root .light { fill: var(--chalk); opacity: 0.5; }
.aeroport-root .light-halo { fill: var(--lit); opacity: 0; }
.aeroport-root.is-night .light, .aeroport-root.is-dusk .light { fill: var(--lit); opacity: 1; }
.aeroport-root.is-night .light-halo { opacity: 0.25; }
.aeroport-root.is-closed .light { fill: var(--accent); opacity: 1; }
.aeroport-root.is-closed .light-halo { fill: var(--accent); opacity: 0.32; }
.aeroport-root .silhouette { fill: var(--ink); }
.aeroport-root .station-band { fill: var(--accent); }
.aeroport-root .station-name { fill: var(--ink); font: 600 15px 'Jost', sans-serif; letter-spacing: 0.08em; }
.aeroport-root .bay-dark { fill: var(--ink); opacity: 0.85; }
.aeroport-root .bay-door { fill: color-mix(in srgb, var(--facade) 70%, var(--ink)); }
.aeroport-root .bay-seams { fill: none; stroke: var(--ink); stroke-opacity: 0.25; stroke-width: 1.5; }
.aeroport-root .bay-number { fill: var(--ink); opacity: 0.6; font: 600 10px 'Jost', sans-serif; }
.aeroport-root .hose-window { fill: var(--glass); }
`;
