import type { Point } from '@deskorama/core';

/** Where each cloud starts at midnight, as a share of the width, its height and its size. */
const CLOUDS = [
  { x: 0.08, y: 120, scale: 1.3 },
  { x: 0.39, y: 70, scale: 0.9 },
  { x: 0.68, y: 380, scale: 1.1 },
  { x: 0.23, y: 300, scale: 0.75 },
] as const;

/** How far a cloud drifts per minute of the day, times its size. */
const DRIFT_PX_PER_MINUTE = 0.4;

/**
 * Places the sun or the moon on its arc, centres the tint rings on it, and drifts the clouds, for one hour of the
 * day. The sun shows from 5:48 to 20:24, the moon the rest of the night.
 * @example
 * placeSky(poster, 14.5, 1440, 650); // sun in the early afternoon, clouds drifted by 870 minutes
 */
export function placeSky(poster: SVGElement, hour: number, width: number, horizon: number): void {
  const day = hour >= 5.8 && hour <= 20.4;
  const body = day ? sunAt(hour, width, horizon) : moonAt(hour, width, horizon);
  const at = `translate(${body.x.toFixed(0)} ${body.y.toFixed(0)})`;

  for (const ring of poster.querySelectorAll('.sky-ring')) {
    ring.setAttribute('cx', body.x.toFixed(0));
    ring.setAttribute('cy', body.y.toFixed(0));
  }

  poster.querySelector('.sun')?.setAttribute('transform', at);
  poster.querySelector('.moon')?.setAttribute('transform', at);
  poster.querySelector('.sun')?.setAttribute('opacity', day ? '1' : '0');
  poster.querySelector('.moon')?.setAttribute('opacity', day ? '0' : '1');

  const minutes = hour * 60;
  const wrap = width + 320;
  poster.querySelectorAll('.cloud').forEach((cloud, index) => {
    const start = CLOUDS[index % CLOUDS.length] ?? CLOUDS[0];
    const x = ((start.x * width + minutes * DRIFT_PX_PER_MINUTE * start.scale) % wrap) - 180;
    cloud.setAttribute('transform', `translate(${x.toFixed(1)} ${start.y}) scale(${start.scale})`);
  });
}

/**
 * Returns the sun on its arc: low at 6 h and 20 h, highest early in the afternoon.
 * @example
 * sunAt(13, 1440, 650); // { x: 720, y: about 200 }
 */
function sunAt(hour: number, width: number, horizon: number): Point {
  const share = Math.min(1, Math.max(0, (hour - 6) / 14));

  return { x: 90 + share * (width - 180), y: horizon - 50 - Math.sin(Math.PI * share) * 400 };
}

/**
 * Returns the moon: it rises on the right in the evening and sets on the left at dawn.
 * @example
 * moonAt(3, 1440, 650); // { x: about 470, y: about 190 }
 */
function moonAt(hour: number, width: number, horizon: number): Point {
  const share = Math.min(1, (hour >= 20 ? hour - 20 : hour + 4) / 10);

  return { x: width - 340 - share * (width - 540), y: horizon - 90 - Math.sin(Math.PI * share) * 380 };
}
