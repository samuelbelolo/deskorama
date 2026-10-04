import { ARCHETYPES, LANGUAGES, type GaugeValues, type Language, type Rect } from '@deskorama/core';
import { sourceEventFixture, sourceProfileFixture } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { bladeLines } from '../src/blade-lines.ts';
import { boardLines } from '../src/board-lines.ts';
import { hallLines } from '../src/hall-lines.ts';
import { hasGlyph } from '../src/has-glyph.ts';
import { layoutFor } from '../src/layout.ts';
import { layoutPlaque } from '../src/layout-plaque.ts';
import { PAL } from '../src/palette.ts';
import { plainText } from '../src/plain-text.ts';
import { posterLines } from '../src/poster-lines.ts';
import { rowTops } from '../src/row-tops.ts';
import type { SignLine } from '../src/sign-line.ts';
import { siteSignLines } from '../src/site-sign-lines.ts';
import { TEXT } from '../src/text-for.ts';
import { textWidth } from '../src/text-width.ts';
import { FAKE_SCREEN } from '@deskorama/test-utils';
import { accentClashes } from './accent-clashes.ts';
import { copyIn } from './copy-in.ts';
import { AFTERNOON } from './instants.ts';
import { intersects } from './intersects.ts';
import { lineBox } from './line-box.ts';
import { missingKeys } from './missing-keys.ts';

/**
 * Returns every string of a dictionary with its path, walking nested objects and arrays.
 * @example
 * leaves({ hall: ['INTRUS', 'BLOQUÉS'] }); // [["hall.0", "INTRUS"], ["hall.1", "BLOQUÉS"]]
 */
function leaves(value: unknown, path = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, path === '' ? key : `${path}.${key}`));
}

/** Gauges with numbers as wide as the signs must hold. */
const GAUGES: GaugeValues = { crowd: 1480, daily: 12_345, total: 2418, build: 'idle' };

/** Sources with accented words on their Gauges, to check the signs keep their accents clear. */
const ACCENTED = [
  { name: 'Tramlo', words: { crowd: 'ACTIFS', daily: 'COMMITS', total: 'ISSUES' } },
  { name: 'Orvane', words: { crowd: 'CONNECTÉS', daily: 'INSCRITS', total: 'ÉQUIPES' } },
  { name: 'Lumio', words: { crowd: 'EN LIGNE', daily: 'RÉSERVÉS', total: 'BIENS GÉRÉS' } },
  { name: 'Nuvo', words: { crowd: 'VISITEURS', daily: 'DÉPLOIEMENTS', total: 'ABONNEMENTS' } },
] as const;

/** Facts and details with accents and cedillas on stacked rows. */
const WORDS = [
  { sound: 'PAF !', fact: 'DEMANDE DE FUSION APPROUVÉE', detail: '#418 ÇA CORRIGE LA CONNEXION ÉCLAIR' },
  { sound: 'AÏE !', fact: 'ERREUR EN PRODUCTION RÉPÉTÉE', detail: 'FAÇADE : 3 ÉCHECS' },
] as const;

/**
 * Returns every fixed sign line with the width its sign holds, in native pixels, in one language.
 * @example
 * limits('fr')[0]; // ["site days", "JOURS SANS", 49]
 */
function limits(lang: Language): [string, string, number][] {
  const copy = copyIn(lang);
  const { site, arcade, hall } = copy.text;
  const time = copy.fill(site.live, { time: '23:59' });
  return [
    ['site days', copy.plural(30, site.days), 49],
    ['site day', copy.plural(0, site.days), 49],
    ['site what', site.what, 49],
    ['site idle', site.idle, 70],
    ['site building', `${site.building}...`, 70],
    ['site live', time, 70],
    ['hall', hall[0], 27],
    ['hall', hall[1], 27],
    ['stop', copy.text.props.stop, 15],
    ['arcade title', arcade.title, 66],
    ['arcade ask', copy.fill(arcade.ask, { n: 9 }), 71],
    ['arcade end', arcade.end, 71],
    ['arcade coin', arcade.coin, 71],
    ['board title', copy.fill(copy.text.board.title), 50],
  ];
}

/**
 * Returns the Roles whose Gag is silent in one language.
 * @example
 * silent('fr'); // ["departure", "like", ...]
 */
function silent(lang: Language): string[] {
  return [...ARCHETYPES, 'other' as const].filter((role) => TEXT[lang].sounds[role] === null);
}

describe("L'Immeuble's words", () => {
  test('exist in French and in English, key for key', () => {
    expect(missingKeys(TEXT.fr, TEXT.en)).toEqual([]);
  });

  test('are never empty; a sound is a word or null for a silent Gag, in both languages alike', () => {
    for (const lang of LANGUAGES) {
      const empty = leaves(TEXT[lang]).filter(
        ([path, value]) => !path.startsWith('sounds.') && (typeof value !== 'string' || value.trim() === ''),
      );
      expect({ lang, empty: empty.map(([path]) => path) }).toEqual({ lang, empty: [] });
    }
    expect(silent('fr')).toEqual(silent('en'));
  });

  test('the French scene paints French words: nothing is left as the English one, GAME OVER included', () => {
    const shared = new Set(['STOP', 'VIA', '+1', 'ACCIDENT', 'BZZT !']);
    const english = new Map(leaves(TEXT.en));
    const same = leaves(TEXT.fr).filter(
      ([path, word]) => typeof word === 'string' && english.get(path) === word && !shared.has(word),
    );

    expect(same.map(([path]) => path)).toEqual([]);
    expect(TEXT.fr.arcade.title).not.toMatch(/GAME|OVER/);
  });

  test('every glyph the building draws is in the bitmap font, in both languages', () => {
    const profile = sourceProfileFixture();
    const event = sourceEventFixture();

    for (const lang of LANGUAGES) {
      const copy = copyIn(lang);
      const gaugeWords = Object.values(profile.gauges).flatMap((gauge) => [
        gauge.text[lang].label,
        gauge.text[lang].short,
      ]);
      const eventWords = Object.values(event.text[lang] ?? {});
      const drawn = [
        ...leaves(TEXT[lang]).flatMap(([path, value]) =>
          typeof value === 'string' && path !== 'description' ? [value.replace(/\{\w+\}/g, '')] : [],
        ),
        ...gaugeWords,
        ...eventWords,
        copy.number(GAUGES.daily),
        copy.time(AFTERNOON),
        ...ACCENTED.flatMap((source) => Object.values(source.words)),
      ];
      const missing = drawn.flatMap((text) =>
        Array.from(plainText(text))
          .filter((ch) => !hasGlyph(ch))
          .map((ch) => `"${ch}" in "${text}"`),
      );

      expect({ lang, missing }).toEqual({ lang, missing: [] });
    }
  });

  test('every fixed sign line fits its sign, in both languages', () => {
    for (const lang of LANGUAGES) {
      const long = limits(lang).filter(([, text, max]) => textWidth(plainText(text)) > max);
      expect({ lang, long }).toEqual({ lang, long: [] });
    }
  });

  test('every accent on a stacked sign keeps a free pixel from the row above, in both languages', () => {
    const layout = layoutFor(FAKE_SCREEN);
    const clashes: string[] = [];

    for (const lang of LANGUAGES) {
      for (const source of ACCENTED) {
        const copy = copyIn(lang, source);
        const signs: [string, SignLine[]][] = [
          ['board', boardLines(copy, GAUGES, { x: 3, y: 166, w: 56, h: 28 })],
          ['poster', posterLines(copy, GAUGES.total, { x: 182, y: 167, w: 41, h: 26 }, PAL.ink)],
          ['hall', hallLines(copy, 12, layout)],
          ['site', siteSignLines(copy, 30, { line: copy.text.site.idle, alarm: false, blink: false }, 256, 12)],
          [
            'site live',
            siteSignLines(
              copy,
              0,
              { line: copy.fill(copy.text.site.live, { time: '14:08' }), alarm: false, blink: false },
              256,
              12,
            ),
          ],
          ['blade board tall', bladeLines(copy, GAUGES, 'board', { x: 75, y: 60, w: 45, h: 45 })],
          ['blade board short', bladeLines(copy, GAUGES, 'board', { x: 75, y: 60, w: 45, h: 30 })],
          ['blade poster', bladeLines(copy, GAUGES, 'poster', { x: 75, y: 60, w: 45, h: 45 })],
        ];
        for (const [name, lines] of signs)
          for (const text of accentClashes(lines)) clashes.push(`${lang} ${source.name} ${name}: ${text}`);
      }
    }

    expect(clashes).toEqual([]);
  });

  test('every accent on a plaque keeps a free pixel from the row above, in every block it fits', () => {
    const clashes: string[] = [];

    for (const words of WORDS) {
      for (const [w, h] of [
        [150, 30],
        [105, 30],
        [75, 30],
        [45, 45],
        [30, 75],
      ] as const) {
        const plaque = layoutPlaque(words, w, h);
        if (plaque === null) continue;
        const { tops } = rowTops(plaque.rows);
        const lines = plaque.rows.flatMap((row, i): SignLine[] => {
          const y = tops[i] ?? 0;
          const line = { text: row.text, x: 0, y, scale: row.scale, colour: row.colour };
          return row.tail === undefined
            ? [line]
            : [line, { text: row.tail, x: textWidth(row.text, row.scale) + 8, y, scale: 1, colour: row.colour }];
        });
        for (const text of accentClashes(lines)) clashes.push(`${w}x${h}: ${text}`);
      }
    }

    expect(clashes).toEqual([]);
  });

  test('every sign line stays inside its frame, apart from the others, whatever the Source calls its Gauges', () => {
    const problems: string[] = [];

    for (const lang of LANGUAGES) {
      for (const source of ACCENTED) {
        const copy = copyIn(lang, source);
        const frames: [string, Rect, SignLine[]][] = [
          ['board', { x: 3, y: 166, w: 56, h: 28 }, boardLines(copy, GAUGES, { x: 3, y: 166, w: 56, h: 28 })],
          [
            'poster',
            { x: 182, y: 167, w: 41, h: 26 },
            posterLines(copy, GAUGES.total, { x: 182, y: 167, w: 41, h: 26 }, PAL.ink),
          ],
          [
            'blade board tall',
            { x: 75, y: 60, w: 45, h: 45 },
            bladeLines(copy, GAUGES, 'board', { x: 75, y: 60, w: 45, h: 45 }),
          ],
          [
            'blade board short',
            { x: 75, y: 60, w: 45, h: 30 },
            bladeLines(copy, GAUGES, 'board', { x: 75, y: 60, w: 45, h: 30 }),
          ],
          [
            'blade poster',
            { x: 75, y: 60, w: 45, h: 45 },
            bladeLines(copy, GAUGES, 'poster', { x: 75, y: 60, w: 45, h: 45 }),
          ],
        ];

        for (const [name, frame, lines] of frames) {
          const boxes = lines.map(lineBox);
          boxes.forEach((box, i) => {
            const text = lines[i]?.text ?? '';
            if (
              box.x <= frame.x ||
              box.y <= frame.y ||
              box.x + box.w >= frame.x + frame.w ||
              box.y + box.h >= frame.y + frame.h
            )
              problems.push(`${lang} ${source.name} ${name}: "${text}" leaves its frame`);
            for (const other of boxes.slice(i + 1))
              if (intersects(box, other))
                problems.push(`${lang} ${source.name} ${name}: "${text}" overlaps another line`);
          });
        }
      }
    }

    expect(problems).toEqual([]);
  });

  test('the accent check catches an accent squeezed against the row above', () => {
    const lines: SignLine[] = [
      { text: 'MISE', x: 0, y: 0, scale: 1, colour: PAL.paper },
      { text: 'RÉUSSIE', x: 0, y: 7, scale: 1, colour: PAL.paper },
    ];

    expect(accentClashes(lines)).toEqual(['RÉUSSIE']);
  });
});
