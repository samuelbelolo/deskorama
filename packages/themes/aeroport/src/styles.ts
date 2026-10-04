import { ACTOR_STYLES } from './actor-styles.ts';
import { BOARD_STYLES } from './board-styles.ts';
import { PALETTE } from './palette.ts';
import { RARE_STYLES } from './rare-styles.ts';
import { RECAP_STYLES } from './recap-styles.ts';
import { SCENE_STYLES } from './scene-styles.ts';
import { SIGN_GAP, SIGN_HEIGHT, SIGN_WIDTH } from './sign-size.ts';

/**
 * The Theme's stylesheet, injected once per mount so the package needs no bundler to ship CSS: the fixed inks as
 * custom properties on the root, the sprites, the speech bubbles, the paper props, the Caption and the signs,
 * then the poster's, the board's and the actors' rules. Every class is prefixed with "aeroport-" or scoped to the
 * root. Jost paints the airport, Barlow Condensed the split-flap lines; the page that hosts the Theme loads both
 * fonts, and the fallbacks keep the poster readable without them.
 */
export const STYLES: string = `
.aeroport-root { position: absolute; inset: 0; overflow: hidden; background: ${PALETTE.concrete};
  font-family: 'Jost', 'Futura', 'Avenir Next', sans-serif;
  --ink: ${PALETTE.ink}; --cobalt: ${PALETTE.cobalt}; --chalk: ${PALETTE.chalk}; --concrete: ${PALETTE.concrete};
  --accent: ${PALETTE.orange}; --kraft: ${PALETTE.kraft}; --gold: ${PALETTE.gold}; --lit: ${PALETTE.lit}; }
.aeroport-poster { position: absolute; inset: 0; display: block; }
.aeroport-gag { position: absolute; inset: 0; pointer-events: none; }
.aeroport-fixture, .aeroport-sprite { position: absolute; left: 0; top: 0; }
.aeroport-fixture svg, .aeroport-sprite svg { display: block; }
.aeroport-sprite { transform-origin: 0 0; will-change: transform, opacity; }
.aeroport-crate-label { font-family: 'Jost', 'Futura', sans-serif; font-weight: 700; font-size: 11px;
  letter-spacing: 0.06em; fill: ${PALETTE.ink}; }

.aeroport-bubble { position: absolute; left: 0; top: 0; box-sizing: border-box; padding: 5px 10px 6px;
  border-radius: 12px; background: var(--chalk); color: var(--ink); font: 600 13px/16px 'Jost', sans-serif;
  box-shadow: 0 0 0 1.5px var(--ink); will-change: opacity; }
.aeroport-bubble::after { content: ''; position: absolute; left: var(--tail-x, 16px); bottom: -7px; width: 12px;
  height: 8px; background: var(--ink); clip-path: polygon(0 0, 100% 0, 30% 100%); }
.aeroport-bubble--radio { background: var(--ink); color: var(--chalk); box-shadow: 0 0 0 1.5px var(--chalk); }
.aeroport-bubble--radio::after { background: var(--chalk); }

.aeroport-stamp { position: absolute; left: 0; top: 0; box-sizing: border-box; display: grid; place-items: center;
  padding: 5px 14px 4px; border: 4px solid var(--accent); border-radius: 4px; color: var(--accent);
  font: 700 25px/1 'Jost', sans-serif; letter-spacing: 2px; white-space: nowrap; transform-origin: 50% 50%;
  background: color-mix(in srgb, var(--chalk) 82%, transparent); }
.aeroport-stamp small { font: 600 10px/1.2 'Jost', sans-serif; letter-spacing: 1.4px; color: var(--ink); }
.aeroport-pass-half { position: absolute; left: 0; top: 0; box-sizing: border-box; padding: 6px 8px; height: 30px;
  background: var(--chalk); box-shadow: 0 0 0 1.4px var(--ink); white-space: nowrap; overflow: hidden;
  font: 700 14px/18px 'Jost', sans-serif; letter-spacing: 1px; color: var(--ink); transform-origin: 50% 0; }
.aeroport-pass-half--left { border-right: 2px dashed var(--ink); text-align: right; color: var(--cobalt); }

.aeroport-caption { position: absolute; max-width: 300px; color: ${PALETTE.chalk}; background: ${PALETTE.ink};
  border-radius: 2px; box-shadow: 0 2px 0 rgba(27, 36, 51, 0.25); }
.aeroport-caption-source { display: block; padding: 3px 10px; background: ${PALETTE.cobalt}; font-size: 11px;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.aeroport-caption-fact { display: block; padding: 6px 10px 2px; font-family: 'Barlow Condensed', 'Arial Narrow',
  sans-serif; font-weight: 600; font-size: 22px; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase; }
.aeroport-caption-detail { display: block; padding: 0 10px 8px; font-size: 14px; line-height: 1.3;
  color: ${PALETTE.concrete}; }

.aeroport-signs { position: absolute; left: 0; top: 0; display: flex; gap: ${SIGN_GAP}px; }
.aeroport-sign { box-sizing: border-box; width: ${SIGN_WIDTH}px; height: ${SIGN_HEIGHT}px; padding: 5px 8px 0;
  overflow: hidden; background: ${PALETTE.chalk}; border-top: 4px solid ${PALETTE.cobalt}; color: ${PALETTE.ink};
  box-shadow: 0 2px 0 rgba(27, 36, 51, 0.25); }
.aeroport-sign--news { border-top-color: ${PALETTE.orange}; }
.aeroport-sign--news .aeroport-sign-value { color: ${PALETTE.orange}; }
.aeroport-sign-label { display: block; overflow: hidden; font-size: 9px; font-weight: 600; line-height: 1.15;
  letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; text-overflow: ellipsis; }
.aeroport-sign-value { display: block; font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; font-weight: 600;
  font-size: 22px; line-height: 1.1; white-space: nowrap; }
${SCENE_STYLES}
${BOARD_STYLES}
${ACTOR_STYLES}
${RARE_STYLES}
${RECAP_STYLES}
`;
