/**
 * The stylesheet of everything that stands on the scene or moves through a Gag: planes with their relief wings,
 * vehicles, people, props, pigeons. Flat inks only; orange is live news, gold is never used here.
 */
export const ACTOR_STYLES = `
.aeroport-root .hull, .aeroport-root .tail-logo, .aeroport-root .engine { fill: var(--chalk); }
.aeroport-root .engine { stroke: var(--ink); stroke-width: 0.6; stroke-opacity: 0.35; }
.aeroport-root .belly, .aeroport-root .engine-intake, .aeroport-root .engine-pylon { fill: var(--concrete); }
.aeroport-root .cheatline, .aeroport-root .fin { fill: var(--cobalt); }
.aeroport-root .stabilizer { fill: color-mix(in srgb, var(--cobalt) 60%, var(--ink)); }
.aeroport-root .plane-window { fill: var(--chalk); }
.aeroport-root.is-night .plane-window, .aeroport-root.is-dusk .plane-window { fill: var(--lit); }
.aeroport-root .cockpit, .aeroport-root .engine-exhaust, .aeroport-root .strut, .aeroport-root .wheel { fill: var(--ink); }
.aeroport-root .plane-door { fill: none; stroke: var(--ink); stroke-width: 0.7; opacity: 0.6; }
.aeroport-root .wing-top { fill: color-mix(in srgb, var(--cobalt) 40%, var(--chalk)); stroke: var(--ink);
  stroke-width: 0.8; stroke-opacity: 0.6; }
.aeroport-root .wing-shade { fill: color-mix(in srgb, var(--cobalt) 62%, var(--ink)); }
.aeroport-root .wing-edge { fill: var(--cobalt); }
.aeroport-root .wing-cast { fill: var(--ink); opacity: 0.3; }
.aeroport-root .wing-hi { fill: none; stroke: var(--chalk); stroke-width: 1.4; stroke-linecap: round; opacity: 0.9; }
.aeroport-root .ground-shadow { fill: var(--ink); opacity: 0.2; }
.aeroport-root .plane-title { fill: var(--cobalt); font: 600 6.4px 'Jost', sans-serif; letter-spacing: 0.5px; }
.aeroport-root .plane-tail { fill: var(--cobalt); font: 700 7.5px 'Jost', sans-serif; }
.aeroport-root .cub-body, .aeroport-root .cub-tail { fill: var(--chalk); stroke: var(--ink); stroke-width: 0.8; }
.aeroport-root .cub-wing { fill: var(--cobalt); }
.aeroport-root .cub-wing-shade { fill: color-mix(in srgb, var(--cobalt) 55%, var(--ink)); }
.aeroport-root .cub-wing-hi { fill: none; stroke: color-mix(in srgb, var(--cobalt) 45%, var(--chalk));
  stroke-width: 1.3; stroke-linecap: round; }
.aeroport-root .cub-window { fill: var(--ink); opacity: 0.75; }
.aeroport-root .cub-tag { fill: var(--ink); font: 700 4.6px 'Barlow Condensed', sans-serif; }
.aeroport-root .strut-line, .aeroport-root .banner-rope { fill: none; stroke: var(--ink); stroke-width: 0.8; }
.aeroport-root .prop { fill: var(--ink); opacity: 0.45; }
.aeroport-root .banner { fill: var(--chalk); stroke: var(--ink); stroke-width: 1.2; }
.aeroport-root .banner-text { fill: var(--ink); font: 600 13px 'Jost', sans-serif; letter-spacing: 1px; }
.aeroport-root .leg, .aeroport-root .hat, .aeroport-root .ear, .aeroport-root .flight-bag { fill: var(--ink); }
.aeroport-root .suitcase { fill: var(--cobalt); stroke: var(--ink); stroke-width: 0.6; }
.aeroport-root .bag-handle, .aeroport-root .radio-aerial { fill: none; stroke: var(--ink); stroke-width: 0.9; }
.aeroport-root .radio-set { fill: var(--ink); }
.aeroport-root .radio-arm { stroke: #c48e68; stroke-width: 2; stroke-linecap: round; }
.aeroport-root .crew-suit { fill: var(--cobalt); } .aeroport-root .crew-vest { fill: var(--chalk); }
.aeroport-root .crew-arm { stroke: var(--cobalt); stroke-width: 2.4; stroke-linecap: round; }
.aeroport-root .robot-shell { fill: #6b7a89; stroke: var(--ink); stroke-width: 0.8; }
.aeroport-root .robot-visor, .aeroport-root .robot-eye, .aeroport-root .robot-ball { fill: var(--ink); }
.aeroport-root .robot-alarm { fill: var(--accent); }
.aeroport-root .robot-grille { fill: var(--ink); opacity: 0.55; }
.aeroport-root .robot-antenna { stroke: var(--ink); stroke-width: 1; }
.aeroport-root .pigeon-body { fill: var(--chalk); stroke: var(--ink); stroke-width: 0.7; }
.aeroport-root .pigeon-wing { fill: #5f6976; stroke: var(--ink); stroke-width: 0.5; }
.aeroport-root .pigeon-eye { fill: var(--ink); }
.aeroport-root .pigeon-leg { stroke: var(--accent); stroke-width: 0.8; }
.aeroport-root .stair-side { fill: var(--concrete); stroke: var(--ink); stroke-width: 1; }
.aeroport-root .stair-step { fill: var(--ink); opacity: 0.6; }
.aeroport-root .stair-rail { fill: none; stroke: var(--ink); stroke-width: 1.4; }
.aeroport-root .stair-base, .aeroport-root .trolley, .aeroport-root .pile-post, .aeroport-root .pile-sign { fill: var(--ink); }
.aeroport-root .pile-sign-text { fill: var(--chalk); font: 600 8px 'Jost', sans-serif; letter-spacing: 0.6px; }
.aeroport-root .case-a { fill: var(--cobalt); } .aeroport-root .case-b { fill: #6b7a89; }
.aeroport-root .case-c { fill: var(--kraft); } .aeroport-root .case-d { fill: #4f6b5e; }
.aeroport-root .case-band { fill: var(--ink); opacity: 0.35; }
.aeroport-root .sock-pole { fill: var(--ink); }
.aeroport-root .sock-a { fill: var(--accent); } .aeroport-root .sock-b { fill: var(--chalk); }
.aeroport-root .card { fill: var(--chalk); stroke: var(--ink); stroke-width: 1.4; }
.aeroport-root .card-head { fill: var(--cobalt); }
.aeroport-root .card-text { fill: var(--ink); font: 700 13px 'Barlow Condensed', sans-serif; letter-spacing: 0.6px; }
.aeroport-root .stop-cross { fill: none; stroke: var(--accent); stroke-width: 3.2; stroke-linecap: round; }
.aeroport-root .handle { fill: var(--ink); }
.aeroport-root .gate-booth { fill: var(--concrete); stroke: var(--ink); stroke-width: 1; }
.aeroport-root .gate-window { fill: var(--ink); opacity: 0.75; }
.aeroport-root .gate-sign, .aeroport-root .gate-post, .aeroport-root .pole { fill: var(--ink); }
.aeroport-root .gate-sign-text { fill: var(--chalk); font: 700 9px 'Jost', sans-serif; letter-spacing: 0.6px; }
.aeroport-root .gate-boom { fill: var(--chalk); stroke: var(--ink); stroke-width: 0.8; }
.aeroport-root .gate-stripe, .aeroport-root .flag-cloth { fill: var(--accent); }
.aeroport-root .flag-text { fill: var(--chalk); font: 700 13px 'Jost', sans-serif; letter-spacing: 0.6px; }
.aeroport-root .van-body { fill: var(--ink); }
.aeroport-root .van-window { fill: var(--concrete); opacity: 0.8; }
.aeroport-root .van-band { fill: var(--chalk); }
.aeroport-root .van-text { fill: var(--ink); font: 700 7.5px 'Jost', sans-serif; letter-spacing: 1.4px; }
.aeroport-root .van-roundel, .aeroport-root .coin { fill: var(--accent); }
.aeroport-root .coin { stroke: var(--ink); stroke-width: 1; }
.aeroport-root .van-sign { fill: var(--chalk); font: 700 15px 'Jost', sans-serif; }
.aeroport-root .sack { fill: var(--kraft); stroke: color-mix(in srgb, var(--kraft) 50%, var(--ink)); stroke-width: 1.2; }
.aeroport-root .sack-sign { fill: var(--ink); font: 700 15px 'Jost', sans-serif; }
.aeroport-root .money-tag { fill: var(--accent); stroke: var(--chalk); stroke-width: 4; paint-order: stroke;
  font: 700 30px 'Barlow Condensed', sans-serif; letter-spacing: 1px; }
.aeroport-root .money-ring { fill: var(--ink); stroke: var(--chalk); stroke-width: 3; paint-order: stroke;
  font: 700 12px 'Jost', sans-serif; letter-spacing: 1.5px; }
.aeroport-root .balloon-string { fill: none; stroke: var(--ink); stroke-width: 0.9; }
.aeroport-root .thumb { fill: var(--accent); stroke: var(--ink); stroke-width: 1.4; stroke-linejoin: round; }
.aeroport-root .thumb-cuff { fill: var(--chalk); stroke: var(--ink); stroke-width: 1.2; }
.aeroport-root .thumb-text { fill: var(--ink); font: 700 12px 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; }
.aeroport-root .tag-string { fill: none; stroke: var(--ink); stroke-width: 1; }
.aeroport-root .tug-body { fill: var(--cobalt); } .aeroport-root .tug-window, .aeroport-root .crate-plate { fill: var(--chalk); }
.aeroport-root .crate { fill: var(--kraft); }
.aeroport-root .sticker { fill: var(--accent); }
.aeroport-root .sticker-mark { fill: var(--chalk); font: 700 11px 'Jost', sans-serif; }
`;
