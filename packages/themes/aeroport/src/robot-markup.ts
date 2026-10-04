/**
 * Returns the intruder, a 1960s tin-toy bot with no livery, 18 x 28 units, feet at y 26: slate grey, a dark visor,
 * a grille; its eyes and antenna ball turn orange when its alarm beeps.
 * @example
 * robotMarkup(true).includes('robot-alarm'); // true
 */
export function robotMarkup(beep: boolean): string {
  const eye = beep ? 'robot-eye robot-alarm' : 'robot-eye';

  return `<g class="person robot">
    <path class="robot-antenna" d="M8,-2 V2"/><circle class="${beep ? 'robot-ball robot-alarm' : 'robot-ball'}" cx="8" cy="-3" r="1.8"/>
    <rect class="robot-shell" x="2.5" y="2" width="11" height="7.5" rx="1"/>
    <rect class="robot-visor" x="3.6" y="4.4" width="8.8" height="3"/>
    <circle class="${eye}" cx="6" cy="5.9" r="1.1"/><circle class="${eye}" cx="10" cy="5.9" r="1.1"/>
    <rect class="robot-shell" x="1.5" y="10" width="13" height="10" rx="1"/>
    <rect class="robot-grille" x="4" y="13" width="8" height="1.2"/><rect class="robot-grille" x="4" y="15.6" width="8" height="1.2"/>
    <rect class="leg" x="4" y="20" width="3" height="6"/><rect class="leg" x="9" y="20" width="3" height="6"/>
  </g>`;
}
