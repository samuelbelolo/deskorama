/**
 * The boards' stylesheet: an ink panel, a cobalt title band, and split-flap cells in Barlow Condensed, the closest
 * face to Solari's lettering. A row in orange is live news; older rows are dimmed. The Arrivals board adds its band of
 * Gauge numbers; a failed deploy may lay two full-width lines over the first rows.
 */
export const BOARD_STYLES = `
.aeroport-root .pylon { fill: var(--ink); }
.aeroport-root .pylon-brace { fill: none; stroke: var(--ink); stroke-width: 1.2; opacity: 0.7; }
.aeroport-board { position: absolute; left: 0; top: 0; box-sizing: border-box; padding: 0 8px; background: var(--ink);
  border-radius: 3px; box-shadow: inset 0 0 0 3px var(--cobalt); color: var(--chalk); }
.aeroport-board-band { display: flex; align-items: center; justify-content: space-between; height: 34px;
  margin: 0 -8px; padding: 0 12px; background: var(--cobalt); border-radius: 3px 3px 0 0; }
.aeroport-board-title { font: 600 19px 'Jost', 'Futura', sans-serif; letter-spacing: 0.06em; }
.aeroport-board-runway { display: flex; align-items: center; gap: 8px; font: 500 12px 'Jost', sans-serif; }
.aeroport-board-heads { display: grid; grid-template-columns: 5fr 16fr 12fr; gap: 8px; padding: 4px 0 2px;
  font: 500 10px 'Jost', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.7; }
.aeroport-board-rows { display: grid; gap: 4px; }
.aeroport-board-row { display: grid; grid-template-columns: 5fr 16fr 12fr; gap: 8px; }
.aeroport-flaps { display: flex; gap: 1px; }
.aeroport-flap { flex: 1 1 0; min-width: 0; height: 30px; background: #232d3d; border-radius: 1.5px;
  font: 600 20px/30px 'Barlow Condensed', 'Arial Narrow', sans-serif; text-align: center; white-space: pre;
  box-shadow: inset 0 -15px 0 #2a3547, inset 0 -1px 0 #111823; }
.aeroport-flaps[data-tone='fresh'] { color: #ffffff; }
.aeroport-flaps[data-tone='news'] { color: var(--accent); }
.aeroport-flaps[data-tone='dim'] { color: #7f8995; }
.aeroport-board-runway .aeroport-flaps { width: 92px; }
.aeroport-board-runway .aeroport-flap { height: 22px; font-size: 15px; line-height: 22px; box-shadow: none; }
.aeroport-board-rows { position: relative; }
.aeroport-board-takeover { position: absolute; left: 0; right: 0; top: 0; display: grid; gap: 4px; background: var(--ink); }
.aeroport-board-numbers { display: grid; grid-template-columns: 4fr 5fr 6fr; gap: 12px; padding: 6px 0 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--chalk) 30%, transparent); }
.aeroport-board-number { display: grid; gap: 1px; min-width: 0; }
.aeroport-board-number-label { overflow: hidden; font: 600 9px/1.15 'Jost', sans-serif; letter-spacing: 0.08em;
  text-transform: uppercase; white-space: nowrap; text-overflow: ellipsis; opacity: 0.8; }
.aeroport-board-number .aeroport-flap { height: 30px; font-size: 24px; line-height: 30px; }
`;
