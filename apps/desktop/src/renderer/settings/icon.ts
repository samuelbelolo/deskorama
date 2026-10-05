// The window's glyphs: Phosphor Icons (MIT), regular weight, with a few filled ones for states. Each is bundled as
// the text of its SVG file, so nothing is loaded from the network, and drawn from its one path.
import checkCircleFill from '@phosphor-icons/core/fill/check-circle-fill.svg?raw';
import checkSquareFill from '@phosphor-icons/core/fill/check-square-fill.svg?raw';
import circleFill from '@phosphor-icons/core/fill/circle-fill.svg?raw';
import clockCountdownFill from '@phosphor-icons/core/fill/clock-countdown-fill.svg?raw';
import playFill from '@phosphor-icons/core/fill/play-fill.svg?raw';
import warningCircleFill from '@phosphor-icons/core/fill/warning-circle-fill.svg?raw';
import arrowUpRight from '@phosphor-icons/core/regular/arrow-up-right.svg?raw';
import bug from '@phosphor-icons/core/regular/bug.svg?raw';
import caretLeft from '@phosphor-icons/core/regular/caret-left.svg?raw';
import caretRight from '@phosphor-icons/core/regular/caret-right.svg?raw';
import chatCircleText from '@phosphor-icons/core/regular/chat-circle-text.svg?raw';
import check from '@phosphor-icons/core/regular/check.svg?raw';
import coins from '@phosphor-icons/core/regular/coins.svg?raw';
import confetti from '@phosphor-icons/core/regular/confetti.svg?raw';
import copy from '@phosphor-icons/core/regular/copy.svg?raw';
import dotsThree from '@phosphor-icons/core/regular/dots-three.svg?raw';
import eyeSlash from '@phosphor-icons/core/regular/eye-slash.svg?raw';
import eye from '@phosphor-icons/core/regular/eye.svg?raw';
import fire from '@phosphor-icons/core/regular/fire.svg?raw';
import flag from '@phosphor-icons/core/regular/flag.svg?raw';
import handshake from '@phosphor-icons/core/regular/handshake.svg?raw';
import heart from '@phosphor-icons/core/regular/heart.svg?raw';
import image from '@phosphor-icons/core/regular/image.svg?raw';
import lightning from '@phosphor-icons/core/regular/lightning.svg?raw';
import lockSimple from '@phosphor-icons/core/regular/lock-simple.svg?raw';
import playCircle from '@phosphor-icons/core/regular/play-circle.svg?raw';
import plugsConnected from '@phosphor-icons/core/regular/plugs-connected.svg?raw';
import plus from '@phosphor-icons/core/regular/plus.svg?raw';
import prohibit from '@phosphor-icons/core/regular/prohibit.svg?raw';
import rocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg?raw';
import sealCheck from '@phosphor-icons/core/regular/seal-check.svg?raw';
import signIn from '@phosphor-icons/core/regular/sign-in.svg?raw';
import signOut from '@phosphor-icons/core/regular/sign-out.svg?raw';
import terminalWindow from '@phosphor-icons/core/regular/terminal-window.svg?raw';
import trash from '@phosphor-icons/core/regular/trash.svg?raw';
import xCircle from '@phosphor-icons/core/regular/x-circle.svg?raw';
import { svgGlyph } from './svg-glyph.ts';

/** The name of a glyph the window can draw; a filled one ends in "-fill". */
export type IconName =
  | 'image'
  | 'plugs-connected'
  | 'play-circle'
  | 'terminal-window'
  | 'caret-left'
  | 'caret-right'
  | 'plus'
  | 'dots-three'
  | 'copy'
  | 'check'
  | 'eye'
  | 'eye-slash'
  | 'arrow-up-right'
  | 'lock-simple'
  | 'sign-in'
  | 'sign-out'
  | 'handshake'
  | 'seal-check'
  | 'x-circle'
  | 'trash'
  | 'heart'
  | 'chat-circle-text'
  | 'confetti'
  | 'coins'
  | 'prohibit'
  | 'bug'
  | 'lightning'
  | 'flag'
  | 'rocket-launch'
  | 'fire'
  | 'check-circle-fill'
  | 'clock-countdown-fill'
  | 'warning-circle-fill'
  | 'circle-fill'
  | 'check-square-fill'
  | 'play-fill';

/** The SVG file of every glyph the window draws, by name. */
const GLYPHS: Readonly<Record<IconName, string>> = {
  image: image,
  'plugs-connected': plugsConnected,
  'play-circle': playCircle,
  'terminal-window': terminalWindow,
  'caret-left': caretLeft,
  'caret-right': caretRight,
  plus: plus,
  'dots-three': dotsThree,
  copy: copy,
  check: check,
  eye: eye,
  'eye-slash': eyeSlash,
  'arrow-up-right': arrowUpRight,
  'lock-simple': lockSimple,
  'sign-in': signIn,
  'sign-out': signOut,
  handshake: handshake,
  'seal-check': sealCheck,
  'x-circle': xCircle,
  trash: trash,
  heart: heart,
  'chat-circle-text': chatCircleText,
  confetti: confetti,
  coins: coins,
  prohibit: prohibit,
  bug: bug,
  lightning: lightning,
  flag: flag,
  'rocket-launch': rocketLaunch,
  fire: fire,
  'check-circle-fill': checkCircleFill,
  'clock-countdown-fill': clockCountdownFill,
  'warning-circle-fill': warningCircleFill,
  'circle-fill': circleFill,
  'check-square-fill': checkSquareFill,
  'play-fill': playFill,
};

/** The one path of each glyph, cut out of its SVG file once, when the window loads. */
const PATHS: ReadonlyMap<string, string> = new Map(
  Object.entries(GLYPHS).map(([name, file]): [string, string] => [name, glyphPath(name, file)]),
);

/** The side of the square every Phosphor glyph is drawn in. */
const GLYPH_SIZE = 256;

/**
 * Returns a glyph as an inline SVG that takes the colour and the size of the text around it.
 * @example
 * icon('copy'); // <svg class="icon" viewBox="0 0 256 256" aria-hidden="true">…</svg>
 * icon('check-circle-fill'); // the filled check, for a state
 */
export function icon(name: IconName): SVGSVGElement {
  const path = PATHS.get(name);

  if (path === undefined) throw new Error(`The window has no glyph named "${name}".`);

  return svgGlyph(GLYPH_SIZE, path, 'icon');
}

/**
 * Returns the one path a glyph is drawn from, cut out of the text of its SVG file; throws, naming the glyph, when
 * the file holds none, so a glyph is never drawn blank.
 * @example
 * glyphPath('copy', '<svg viewBox="0 0 256 256"><path d="M216,32H88…"/></svg>'); // 'M216,32H88…'
 */
function glyphPath(name: string, file: string): string {
  const path = / d="([^"]+)"/.exec(file)?.[1];

  if (path === undefined) throw new Error(`The file of the glyph "${name}" holds no path to draw.`);

  return path;
}
