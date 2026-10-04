/**
 * Returns the console and the controller's three poses around it: at ease, watching through binoculars while a
 * deploy runs, and asleep on the desk at night. The tower shows the pose that matches its `data-pose`.
 * @example
 * controllerMarkup(1372, 362).includes('pose-watch'); // true
 */
export function controllerMarkup(cx: number, floor: number): string {
  return `<rect class="console" x="${cx - 46}" y="${floor - 12}" width="92" height="12"/>
    <g class="pose pose-idle">
      <circle class="skin" cx="${cx + 10}" cy="${floor - 31}" r="7"/>
      <path class="uniform" d="M${cx},${floor - 12} q10,-16 20,0 Z"/>
      <rect class="cap" x="${cx + 3}" y="${floor - 40}" width="14" height="4"/>
    </g>
    <g class="pose pose-watch">
      <circle class="skin" cx="${cx - 8}" cy="${floor - 40}" r="7"/>
      <path class="uniform" d="M${cx - 18},${floor - 12} q10,-24 20,0 Z"/>
      <rect class="binoculars" x="${cx - 26}" y="${floor - 44}" width="12" height="7"/>
      <path class="arm" d="M${cx - 10},${floor - 28} l-10,-11"/>
    </g>
    <g class="pose pose-sleep">
      <circle class="skin" cx="${cx + 2}" cy="${floor - 18}" r="7"/>
      <path class="uniform" d="M${cx + 6},${floor - 12} q12,-14 22,0 Z"/>
      <text class="zz" x="${cx + 8}" y="${floor - 26}">z</text>
      <text class="zz zz-big" x="${cx + 18}" y="${floor - 38}">z</text>
      <circle class="lamp" cx="${cx - 30}" cy="${floor - 16}" r="4"/>
    </g>`;
}
