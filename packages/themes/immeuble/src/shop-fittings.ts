import { blit } from './blit.ts';
import { dither } from './dither.ts';
import { FURNITURE, LEGEND, type FurnitureName } from './furniture-sprites.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import type { ShopId } from './shops.ts';
import { sprite } from './sprite.ts';

/** Where a unit's fittings go: its left edge, the top of the ground floor and its floor line, and its tone. */
export interface Fitting {
  readonly x: number;
  readonly top: number;
  readonly floor: number;
  readonly tone: Tone;
  readonly toneName: string;
}

/**
 * Draws a piece of furniture standing on the unit's floor, or at a height when given.
 * @example
 * piece(ctx, at, 'PRINTER', 80);
 */
function piece(ctx: CanvasRenderingContext2D, at: Fitting, name: FurnitureName, dx: number, y?: number): void {
  const art = sprite(name, FURNITURE[name], LEGEND, at.tone, at.toneName);
  blit(ctx, art, at.x + dx, y ?? at.floor - 1 - art.height);
}

/** What each ground-floor unit holds. The agency's board and the kiosk's poster are signs, drawn over the scene. */
export const FITTINGS: Readonly<Record<ShopId, (ctx: CanvasRenderingContext2D, at: Fitting) => void>> = {
  agency(ctx, at) {
    paint(ctx, at.x + 2, at.top + 2, 56, 24, PAL.ink);
    paint(ctx, at.x + 3, at.top + 3, 54, 22, PAL.night);
    for (let i = 0; i < 4; i += 1) piece(ctx, at, 'NOTICE', 62 + (i % 2) * 7, at.top + 4 + Math.floor(i / 2) * 7);
    piece(ctx, at, 'PRINTER', 80);
    piece(ctx, at, 'PLANT', 66);
  },
  hall(ctx, at) {
    paint(ctx, at.x + 2, at.top + 6, 13, 21, PAL.ink);
    paint(ctx, at.x + 3, at.top + 7, 11, 20, at.tone('wood'));
    paint(ctx, at.x + 8, at.top + 7, 1, 20, at.tone('umber'));
    paint(ctx, at.x + 4, at.top + 5, 9, 1, PAL.ink);
    dither(ctx, at.x + 1, at.floor - 1, 29, 1, at.tone('paper'), PAL.ink);
  },
  loge(ctx, at) {
    paint(ctx, at.x + 2, at.top + 4, 14, 12, at.tone('stone'));
    dither(ctx, at.x + 3, at.top + 5, 12, 10, at.tone('paper'), at.tone('haze'));
    piece(ctx, at, 'KEYS', 20, at.top + 6);
    paint(ctx, at.x + 1, at.floor - 9, 18, 8, at.tone('umber'));
    paint(ctx, at.x + 1, at.floor - 9, 18, 1, at.tone('wood'));
    piece(ctx, at, 'TV_OFF', 34, at.floor - 13);
  },
  kiosk(ctx, at) {
    piece(ctx, at, 'NEWSPAPERS', 4);
    piece(ctx, at, 'NEWSPAPERS', 22);
  },
  bakery(ctx, at) {
    piece(ctx, at, 'BAGUETTES', 4, at.floor - 13);
    piece(ctx, at, 'BAGUETTES', 16, at.floor - 13);
    paint(ctx, at.x + 2, at.floor - 7, 40, 6, at.tone('umber'));
    paint(ctx, at.x + 2, at.floor - 7, 40, 1, at.tone('paper'));
  },
  cafe(ctx, at) {
    paint(ctx, at.x + 3, at.top + 6, 20, 1, at.tone('umber'));
    for (let i = 0; i < 5; i += 1)
      paint(ctx, at.x + 4 + i * 4, at.top + 2, 2, 4, at.tone(i % 2 === 1 ? 'leaf' : 'moss'));
    piece(ctx, at, 'COFFEE_MACHINE', 28, at.floor - 13);
    paint(ctx, at.x + 2, at.floor - 9, 41, 2, at.tone('zinc'));
    paint(ctx, at.x + 3, at.floor - 7, 39, 6, at.tone('wood'));
  },
  florist(ctx, at) {
    for (let i = 0; i < 4; i += 1) piece(ctx, at, 'FLOWERS', 3 + i * 10);
    for (let i = 0; i < 3; i += 1) piece(ctx, at, 'FLOWERS', 7 + i * 12, at.top + 8);
    paint(ctx, at.x + 5, at.top + 13, 36, 1, at.tone('wood'));
  },
};
