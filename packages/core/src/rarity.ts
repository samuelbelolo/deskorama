/**
 * How rare an Event is, from several per hour (`common`) to the one legendary scene (`jackpot`).
 * A Theme sizes its Gag by rarity.
 */
export type Rarity = 'common' | 'notable' | 'rare' | 'jackpot';

/** Every rarity, from the most frequent to the rarest. */
export const RARITIES: readonly Rarity[] = ['common', 'notable', 'rare', 'jackpot'];
