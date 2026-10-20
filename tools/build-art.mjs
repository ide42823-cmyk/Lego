/**
 * Builds the app's own decorative art.
 *
 * The profile needs a crest, an avatar frame and two effects, and none of them
 * should be a one-off hand-drawn bitmap: they are generated here so the shapes,
 * gradients and sizes stay editable, and so the art is original rather than
 * borrowed from a reference app.
 *
 *   node tools/build-art.mjs
 *
 * Writes the SVG source to `assets/art/` and the rasterised PNG to
 * `assets/media/art/`. Re-run after editing a shape.
 */

import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SVG_DIR = join(ROOT, 'assets', 'art');
const PNG_DIR = join(ROOT, 'assets', 'media', 'art');

const round = (value) => Number(value.toFixed(2));

/** Repeats a shape around a centre. */
function radial(count, cx, cy, render) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    return render(angle, index);
  }).join('');
}

/**
 * The profile crest: a gold laurel of petals around a rose enamel disc, with a
 * gem at the foot. The app draws the member's own glyph in the middle, so the
 * enamel stays empty.
 */
function crest() {
  const petals = radial(16, 256, 256, (angle, index) => {
    const fill = index % 2 === 0 ? 'url(#petalGold)' : 'url(#petalRose)';
    return `<path d="M256 40 C288 92 296 130 256 172 C216 130 224 92 256 40 Z"
      fill="${fill}" transform="rotate(${angle} 256 256)" />`;
  });

  const pearls = radial(8, 256, 256, (angle) => {
    const radians = (angle * Math.PI) / 180;
    const x = round(256 + Math.sin(radians) * 172);
    const y = round(256 - Math.cos(radians) * 172);
    return `<circle cx="${x}" cy="${y}" r="6.5" fill="url(#pearl)" />`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="drop" cx="50%" cy="58%" r="50%">
      <stop offset="55%" stop-color="#3A0E20" stop-opacity="0.30" />
      <stop offset="100%" stop-color="#3A0E20" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="petalGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE6A8" />
      <stop offset="55%" stop-color="#F6C55A" />
      <stop offset="100%" stop-color="#D99B2B" />
    </linearGradient>
    <linearGradient id="petalRose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFC2DA" />
      <stop offset="60%" stop-color="#F27BA6" />
      <stop offset="100%" stop-color="#C93E75" />
    </linearGradient>
    <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE9B4" />
      <stop offset="45%" stop-color="#F7C85F" />
      <stop offset="100%" stop-color="#C98A24" />
    </linearGradient>
    <radialGradient id="pearl" cx="34%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#FFFDF4" />
      <stop offset="70%" stop-color="#F6D98C" />
      <stop offset="100%" stop-color="#C79433" />
    </radialGradient>
    <radialGradient id="enamel" cx="38%" cy="30%" r="78%">
      <stop offset="0%" stop-color="#FFC6DD" />
      <stop offset="45%" stop-color="#FB84B1" />
      <stop offset="100%" stop-color="#D63373" />
    </radialGradient>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD6E6" />
      <stop offset="50%" stop-color="#F2689C" />
      <stop offset="100%" stop-color="#B92D63" />
    </linearGradient>
  </defs>

  <ellipse cx="256" cy="286" rx="238" ry="214" fill="url(#drop)" />
  ${petals}
  <circle cx="256" cy="256" r="172" fill="none" stroke="url(#ringGold)" stroke-width="9" />
  ${pearls}
  <circle cx="256" cy="256" r="160" fill="#FFE3EE" />
  <circle cx="256" cy="256" r="150" fill="url(#enamel)" />
  <circle cx="256" cy="256" r="150" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" />
  <ellipse cx="206" cy="196" rx="62" ry="40" fill="#FFFFFF" fill-opacity="0.26" transform="rotate(-28 206 196)" />

  <!-- No emblem inside the enamel: the screen draws the member's own glyph there. -->
  <g transform="translate(256 398)">
    <path d="M0 -34 L26 0 L0 34 L-26 0 Z" fill="url(#gem)" stroke="url(#ringGold)" stroke-width="5" />
    <path d="M0 -18 L11 0 L0 18 L-11 0 Z" fill="#FFFFFF" fill-opacity="0.45" />
  </g>
</svg>`;
}

/**
 * A ring for avatars: a gold band, a hairline of light and four rose gems. The
 * centre stays transparent so the photo shows through.
 */
function avatarFrame() {
  const gems = radial(4, 256, 256, (angle) => {
    const radians = (angle * Math.PI) / 180;
    const x = round(256 + Math.sin(radians) * 240);
    const y = round(256 - Math.cos(radians) * 240);
    return `<g transform="translate(${x} ${y}) rotate(${angle})">
      <path d="M0 -30 L20 0 L0 30 L-20 0 Z" fill="url(#gem)" stroke="url(#band)" stroke-width="4" />
      <path d="M0 -15 L8 0 L0 15 L-8 0 Z" fill="#FFFFFF" fill-opacity="0.5" />
    </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFEDBE" />
      <stop offset="40%" stop-color="#F6C55A" />
      <stop offset="70%" stop-color="#FFE3A2" />
      <stop offset="100%" stop-color="#C98A24" />
    </linearGradient>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD6E6" />
      <stop offset="55%" stop-color="#F2689C" />
      <stop offset="100%" stop-color="#B92D63" />
    </linearGradient>
  </defs>

  <circle cx="256" cy="256" r="249" fill="none" stroke="#3A0E20" stroke-opacity="0.18" stroke-width="6" />
  <circle cx="256" cy="256" r="240" fill="none" stroke="url(#band)" stroke-width="24" />
  <circle cx="256" cy="256" r="228" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="4" />
  ${gems}
</svg>`;
}

/** Winged heart for the couple tile: two feathered wings and a glossy heart. */
function wingHeart() {
  const wing = (direction) => {
    const transform = direction === 'left' ? 'translate(512 0) scale(-1 1)' : '';
    return `<g transform="${transform}">
      <path d="M300 118 C352 74 424 54 496 66 C446 100 384 130 316 140 Z" fill="url(#feather)" />
      <path d="M302 128 C356 96 420 82 486 92 C436 118 378 140 312 146 Z" fill="url(#featherWarm)" fill-opacity="0.95" />
      <path d="M306 140 C350 122 396 114 440 118 C400 138 356 150 318 152 Z" fill="#FFFFFF" fill-opacity="0.85" />
      <path d="M300 118 C352 74 424 54 496 66" fill="none" stroke="#FFD9E8" stroke-width="3" />
    </g>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="40%" stop-color="#FF7FAF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FF7FAF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="heart" cx="36%" cy="26%" r="82%">
      <stop offset="0%" stop-color="#FFC9DE" />
      <stop offset="45%" stop-color="#FF6FA0" />
      <stop offset="100%" stop-color="#C72463" />
    </radialGradient>
    <linearGradient id="feather" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FFF0F6" />
    </linearGradient>
    <linearGradient id="featherWarm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFF9FC" />
      <stop offset="100%" stop-color="#FFC9DE" />
    </linearGradient>
  </defs>

  <ellipse cx="256" cy="122" rx="228" ry="92" fill="url(#glow)" />
  ${wing('right')}
  ${wing('left')}

  <path d="M256 196 C196 158 176 108 208 80 C232 59 252 70 256 90 C260 70 280 59 304 80 C336 108 316 158 256 196 Z"
    fill="url(#heart)" stroke="#FFD3E4" stroke-width="5" />
  <ellipse cx="232" cy="96" rx="17" ry="10" fill="#FFFFFF" fill-opacity="0.7" transform="rotate(-24 232 96)" />

  <g fill="#FFFFFF">
    <path d="M188 44 L193 58 L207 63 L193 68 L188 82 L183 68 L169 63 L183 58 Z" fill-opacity="0.9" />
    <path d="M336 34 L340 45 L351 49 L340 53 L336 64 L332 53 L321 49 L332 45 Z" fill-opacity="0.75" />
  </g>
</svg>`;
}

/**
 * The soft cloud band behind the couple tile. Each puff is a radial gradient
 * rather than a blurred shape, so the result is identical in every rasteriser.
 */
function clouds() {
  const puffs = [
    [70, 210, 150, 78, 0.75],
    [190, 178, 170, 92, 0.9],
    [330, 208, 190, 96, 0.8],
    [470, 176, 160, 88, 0.85],
    [610, 214, 170, 84, 0.7],
    [120, 268, 190, 70, 0.55],
    [380, 282, 220, 72, 0.5],
    [560, 272, 180, 66, 0.6],
    [256, 128, 210, 72, 0.35],
  ]
    .map(
      ([cx, cy, rx, ry, opacity]) =>
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#puff)" opacity="${opacity}" />`,
    )
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
  <defs>
    <radialGradient id="puff" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.98" />
      <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.72" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="puffRose" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#FFD3E6" stop-opacity="0.9" />
      <stop offset="60%" stop-color="#FFB6D5" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FFB6D5" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
      <stop offset="22%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="78%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <mask id="band">
      <rect width="720" height="360" fill="url(#fade)" />
    </mask>
  </defs>

  <g mask="url(#band)">
    <ellipse cx="360" cy="250" rx="380" ry="96" fill="url(#puffRose)" opacity="0.85" />
    ${puffs}
  </g>
</svg>`;
}

/**
 * The three honour walls (reference screen 025). One shape, three tones: a plate
 * with a metal double border, filigree sprigs in the corners and a glass shelf
 * near the foot that the collectibles stand on. The title plaque and the count
 * chip are deliberately *not* baked in — they carry text, so the screen draws
 * them and they stay translatable and mirrored in RTL.
 */
const HONOR_TONES = {
  badges: {
    light: {
      top: '#FFF6E4',
      bottom: '#F8D9A8',
      metalA: '#FFEFC6',
      metalB: '#F2B850',
      metalC: '#B97A1E',
      shelf: '#F7CE86',
      shelfTop: '#FFF6E0',
    },
    dark: {
      top: '#3B2A14',
      bottom: '#221706',
      metalA: '#FFE3AE',
      metalB: '#D69A2E',
      metalC: '#8A5E14',
      shelf: '#7A5316',
      shelfTop: '#E8C275',
    },
  },
  titles: {
    light: {
      top: '#F9F2FF',
      bottom: '#E4D2FB',
      metalA: '#F5EAFF',
      metalB: '#AB6FF0',
      metalC: '#6B3BC0',
      shelf: '#E3CDFB',
      shelfTop: '#F8F0FF',
    },
    dark: {
      top: '#2E2142',
      bottom: '#1A1230',
      metalA: '#E7D6FF',
      metalB: '#9B6BE0',
      metalC: '#5B3597',
      shelf: '#40295F',
      shelfTop: '#C9AEF0',
    },
  },
  gifts: {
    light: {
      top: '#F1F6FF',
      bottom: '#D6E4FB',
      metalA: '#F4F9FF',
      metalB: '#82A6EE',
      metalC: '#3F5FBF',
      shelf: '#D6E5FC',
      shelfTop: '#F3F8FF',
    },
    dark: {
      top: '#1F2B46',
      bottom: '#111A2E',
      metalA: '#DCE9FF',
      metalB: '#6C8DE2',
      metalC: '#31488F',
      shelf: '#22335A',
      shelfTop: '#A9C2F2',
    },
  },
};

function honorPanelGradients(tone) {
  return `<defs>
    <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${tone.top}" />
      <stop offset="100%" stop-color="${tone.bottom}" />
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${tone.metalA}" />
      <stop offset="45%" stop-color="${tone.metalB}" />
      <stop offset="100%" stop-color="${tone.metalC}" />
    </linearGradient>
    <linearGradient id="metalLight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tone.metalA}" />
      <stop offset="100%" stop-color="${tone.metalB}" />
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${tone.shelf}" />
      <stop offset="100%" stop-color="${tone.metalC}" stop-opacity="0.5" />
    </linearGradient>
    <linearGradient id="shelfTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${tone.shelfTop}" stop-opacity="0.15" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="${tone.shelfTop}" stop-opacity="0.15" />
    </linearGradient>
    <radialGradient id="pearl" cx="34%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#FFFDF4" />
      <stop offset="100%" stop-color="${tone.metalB}" />
    </radialGradient>
  </defs>`;
}

function honorPanel(tone) {
  const sprig = `
    <path d="M6 66 C6 33 33 6 66 6" fill="none" stroke="url(#metal)" stroke-width="7" stroke-linecap="round" />
    <path d="M20 48 C38 48 48 38 48 20 C30 20 20 30 20 48 Z" fill="url(#metalLight)" opacity="0.95" />
    <path d="M28 40 C34 40 40 34 40 28 C34 28 28 34 28 40 Z" fill="${tone.top}" opacity="0.75" />
    <path d="M9 36 C20 34 28 26 30 13" fill="none" stroke="url(#metalLight)" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
    <circle cx="66" cy="6" r="5.5" fill="url(#pearl)" />
    <circle cx="9" cy="36" r="3.2" fill="url(#pearl)" />`;

  const corners = [
    [42, 34, 1, 1],
    [618, 34, -1, 1],
    [42, 186, 1, -1],
    [618, 186, -1, -1],
  ]
    .map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${sprig}</g>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="220" viewBox="0 0 660 220">
  ${honorPanelGradients(tone)}

  <rect x="16" y="16" width="628" height="196" rx="36" fill="#1A0E2A" opacity="0.10" />
  <rect x="10" y="10" width="640" height="196" rx="34" fill="url(#plate)" />
  <rect x="24" y="22" width="612" height="52" rx="24" fill="url(#sheen)" opacity="0.32" />

  <rect x="56" y="168" width="548" height="16" rx="8" fill="url(#shelf)" />
  <rect x="56" y="168" width="548" height="3" rx="1.5" fill="url(#shelfTop)" opacity="0.95" />
  <rect x="56" y="180" width="548" height="2.5" rx="1.25" fill="#1A0E2A" opacity="0.18" />
  <rect x="60" y="186" width="540" height="7" rx="3.5" fill="#1A0E2A" opacity="0.10" />

  <rect x="10" y="10" width="640" height="196" rx="34" fill="none" stroke="url(#metal)" stroke-width="7" />
  <rect x="23" y="23" width="614" height="170" rx="26" fill="none" stroke="url(#metalLight)" stroke-width="2" opacity="0.7" />

  ${corners}
</svg>`;
}

/** A medal for the Badges Wall: a gem-set ring around an empty enamel disc. */
function honorMedal(tone) {
  const gems = radial(4, 110, 110, (angle) => {
    const radians = (angle * Math.PI) / 180;
    const x = round(110 + Math.sin(radians) * 92);
    const y = round(110 - Math.cos(radians) * 92);
    return `<g transform="translate(${x} ${y}) rotate(${angle + 45})">
      <path d="M0 -14 L10 0 L0 14 L-10 0 Z" fill="url(#gem)" stroke="url(#metal)" stroke-width="2.5" />
      <path d="M0 -7 L4 0 L0 7 L-4 0 Z" fill="#FFFFFF" fill-opacity="0.55" />
    </g>`;
  });

  const ticks = radial(28, 110, 110, (angle) => {
    const radians = (angle * Math.PI) / 180;
    const inner = 78;
    const outer = 86;
    return `<line x1="${round(110 + Math.sin(radians) * inner)}" y1="${round(
      110 - Math.cos(radians) * inner,
    )}" x2="${round(110 + Math.sin(radians) * outer)}" y2="${round(
      110 - Math.cos(radians) * outer,
    )}" stroke="${tone.metalC}" stroke-opacity="0.35" stroke-width="2" />`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${tone.metalA}" />
      <stop offset="48%" stop-color="${tone.metalB}" />
      <stop offset="100%" stop-color="${tone.metalC}" />
    </linearGradient>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD6E6" />
      <stop offset="55%" stop-color="#F2689C" />
      <stop offset="100%" stop-color="#B92D63" />
    </linearGradient>
    <radialGradient id="enamel" cx="38%" cy="28%" r="80%">
      <stop offset="0%" stop-color="${tone.top}" />
      <stop offset="60%" stop-color="${tone.bottom}" />
      <stop offset="100%" stop-color="${tone.metalC}" stop-opacity="0.55" />
    </radialGradient>
  </defs>

  <ellipse cx="110" cy="124" rx="96" ry="88" fill="#1A0E2A" opacity="0.10" />
  <circle cx="110" cy="110" r="92" fill="none" stroke="url(#metal)" stroke-width="16" />
  ${ticks}
  <circle cx="110" cy="110" r="74" fill="url(#enamel)" />
  <circle cx="110" cy="110" r="74" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2.5" />
  <ellipse cx="86" cy="72" rx="38" ry="21" fill="#FFFFFF" fill-opacity="0.3" transform="rotate(-28 86 72)" />
  ${gems}
</svg>`;
}

/** A framed plaque for a gift: the screen draws the gift's own glyph inside. */
function honorGiftFrame(tone) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <defs>
    <linearGradient id="face" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${tone.top}" />
      <stop offset="100%" stop-color="${tone.bottom}" />
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${tone.metalA}" />
      <stop offset="48%" stop-color="${tone.metalB}" />
      <stop offset="100%" stop-color="${tone.metalC}" />
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
      <stop offset="100%" stop-color="${tone.metalC}" stop-opacity="0.3" />
    </linearGradient>
  </defs>

  <ellipse cx="110" cy="118" rx="98" ry="94" fill="#1A0E2A" opacity="0.10" />
  <rect x="8" y="8" width="204" height="204" rx="44" fill="url(#face)" stroke="url(#metal)" stroke-width="8" />
  <rect x="21" y="21" width="178" height="178" rx="34" fill="none" stroke="${tone.metalA}" stroke-opacity="0.6" stroke-width="2" />
  <path d="M124 9 H164 A44 44 0 0 1 208 53 V93 Z" fill="#FFFFFF" opacity="0.16" />
  <rect x="21" y="110" width="178" height="89" rx="30" fill="url(#floor)" />
</svg>`;
}

const ART = [
  { name: 'crest', svg: crest() },
  { name: 'avatar-frame', svg: avatarFrame() },
  { name: 'wing-heart', svg: wingHeart() },
  { name: 'clouds', svg: clouds() },
];

for (const [key, tones] of Object.entries(HONOR_TONES)) {
  ART.push({ name: `honor-panel-${key}`, svg: honorPanel(tones.light) });
  ART.push({ name: `honor-panel-${key}-dark`, svg: honorPanel(tones.dark) });
}

ART.push({ name: 'honor-medal', svg: honorMedal(HONOR_TONES.badges.light) });
ART.push({ name: 'honor-medal-dark', svg: honorMedal(HONOR_TONES.badges.dark) });
ART.push({ name: 'honor-gift-frame', svg: honorGiftFrame(HONOR_TONES.gifts.light) });
ART.push({ name: 'honor-gift-frame-dark', svg: honorGiftFrame(HONOR_TONES.gifts.dark) });

await mkdir(SVG_DIR, { recursive: true });
await mkdir(PNG_DIR, { recursive: true });

for (const piece of ART) {
  const svgPath = join(SVG_DIR, `${piece.name}.svg`);
  const pngPath = join(PNG_DIR, `${piece.name}.png`);
  await writeFile(svgPath, `${piece.svg}\n`, 'utf8');

  const render = new Resvg(piece.svg, { fitTo: { mode: 'original' } });
  const png = render.render().asPng();
  await writeFile(pngPath, png);
  console.log(`${piece.name.padEnd(14)} ${Math.round(png.length / 1024)}KB`);
}
