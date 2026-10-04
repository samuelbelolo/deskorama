/** How long the tug drives in, and later out. */
export const DRIVE_MS = 1300;

/** How long the tug stands still with its crate. */
export const STOP_MS = 2200;

/** The whole generic Gag: drive in, stop, drive out. */
export const GENERIC_GAG_MS: number = DRIVE_MS * 2 + STOP_MS;
