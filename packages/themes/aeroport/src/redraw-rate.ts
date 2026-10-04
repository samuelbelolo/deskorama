/**
 * The most times per second L'Aéroport redraws. A poster scene reads well at 30: a 120 Hz screen would otherwise
 * redraw it 120 times per second (measured in Electron), and between Gags nothing is redrawn at all.
 */
export const REDRAW_FPS = 30;
