import { sprite } from './sprite.ts';

/** The concierge's portrait for her dialog box: grey bun, her hand over her eyes. */
const PORTRAIT = [
  '......tttt......',
  '.....tttttt.....',
  '......tttt......',
  '....tttttttt....',
  '...tttttttttt...',
  '..ttssssssssst..',
  '..tssssssssssst.',
  '..ssiiiiiiiiiii.',
  '..siiiiiiiiiiii.',
  '..ssiiiiiiiiii..',
  '..sssssssss.ii..',
  '...ssskkkss.ii..',
  '....ssssss..ii..',
  '...mmmmmmmmmii..',
  '..mmmmmmmmmmmm..',
  '.mmmmmmmmmmmmmm.',
] as const;

/**
 * Returns the concierge's facepalm portrait, 16 x 16 native pixels.
 * @example
 * blit(ctx, portraitSprite(), 30, 170);
 */
export function portraitSprite(): HTMLCanvasElement {
  return sprite('portrait-palm', PORTRAIT, { t: 'stone2', s: 'skin', i: 'skin2', k: 'ink', m: 'moss' });
}
