/**
 * Downloads the placeholder photography the fixtures point at.
 *
 * These images are test content, not product art: they let the UI be reviewed
 * against real photography (crops, contrast, text over image) instead of colour
 * blocks, and every one of them is meant to be replaced. Sources are free to use
 * without attribution — see `assets/media/README.md`.
 *
 *   node tools/fetch-test-media.mjs
 *
 * Files are split by the gender the photo presents, so a fixture member's avatar,
 * cover and chips agree. Skips files that already exist, so it is safe to re-run.
 */

import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

/** Unsplash's CDN accepts imgix parameters; `crop=faces` keeps faces in frame. */
function unsplash(id, width, height) {
  const params = new URLSearchParams({
    w: String(width),
    h: String(height),
    fit: 'crop',
    crop: 'faces',
    q: '76',
    fm: 'jpg',
  });
  return `https://images.unsplash.com/${id}?${params.toString()}`;
}

/** The community placeholder service, used where its faces fill a gap. */
function portrait(image) {
  return `https://i.pravatar.cc/256?img=${image}`;
}

// Twelve per gender: enough that no two members in one list share a face.
const PORTRAITS = {
  f01: unsplash('photo-1494790108377-be9c29b29330', 256, 256),
  f02: unsplash('photo-1534528741775-53994a69daeb', 256, 256),
  f03: unsplash('photo-1517841905240-472988babdf9', 256, 256),
  f04: unsplash('photo-1524504388940-b1c1722653e1', 256, 256),
  f05: unsplash('photo-1531123897727-8f129e1688ce', 256, 256),
  f06: unsplash('photo-1544005313-94ddf0286df2', 256, 256),
  f07: unsplash('photo-1529626455594-4ff0802cfb7e', 256, 256),
  f08: unsplash('photo-1524250502761-1ac6f2e30d43', 256, 256),
  f09: portrait(5),
  f10: portrait(9),
  f11: portrait(10),
  f12: unsplash('photo-1548142813-c348350df52b', 256, 256),
  m01: unsplash('photo-1500648767791-00dcc994a43e', 256, 256),
  m02: unsplash('photo-1506794778202-cad84cf45f1d', 256, 256),
  m03: unsplash('photo-1521119989659-a83eee488004', 256, 256),
  m04: unsplash('photo-1531427186611-ecfd6d936c79', 256, 256),
  m05: portrait(1),
  m06: portrait(3),
  m07: portrait(7),
  m08: portrait(8),
  m09: portrait(11),
  m10: portrait(12),
  m11: unsplash('photo-1492562080023-ab3db95bfbce', 256, 256),
  m12: unsplash('photo-1507003211169-0a1dd7228f2d', 256, 256),
  // The signed-in member's own photo, so the Me tab is not the only monogram in
  // an otherwise photographic app.
  self: unsplash('photo-1531746020798-e6953c6e8e04', 256, 256),
};

// Portrait-orientation covers: the profile hero is a 3:4-ish crop.
const COVERS = {
  f01: unsplash('photo-1508214751196-bcfd4ca60f91', 720, 1280),
  f02: unsplash('photo-1502378735452-bc7d86632805', 720, 1280),
  f03: unsplash('photo-1502823403499-6ccfcf4fb453', 720, 1280),
  m01: unsplash('photo-1519085360753-af0119f7cbe7', 720, 1280),
  m02: unsplash('photo-1552058544-f2b08422138a', 720, 1280),
  m03: unsplash('photo-1547425260-76bcadfb4f2c', 720, 1280),
  m04: unsplash('photo-1519345182560-3f2917c472ef', 720, 1280),
};

// Moment media: a portrait crop, the shape the reference gives post images.
const POSTS = {
  f01: unsplash('photo-1488426862026-3ee34a7d66df', 600, 800),
  f02: unsplash('photo-1521146764736-56c929d59c83', 600, 800),
  f03: unsplash('photo-1487412720507-e7ab37603c6f', 600, 800),
  f04: unsplash('photo-1509967419530-da38b4704bc6', 600, 800),
  f05: unsplash('photo-1517365830460-955ce3ccd263', 600, 800),
  f06: unsplash('photo-1508216310976-c518daae0cdc', 600, 800),
  m01: unsplash('photo-1557862921-37829c790f19', 600, 800),
  m02: unsplash('photo-1560250097-0b93528c311a', 600, 800),
};

// Wide atmosphere shots for room cards: the reference leads each card with
// artwork rather than a colour block.
const ROOMS = {
  r01: unsplash('photo-1519671482749-fd09be7ccebf', 720, 480),
  r02: unsplash('photo-1493225457124-a3eb161ffa5f', 720, 480),
  r03: unsplash('photo-1516450360452-9312f5e86fc7', 720, 480),
  r04: unsplash('photo-1560448204-e02f11c3d0e2', 720, 480),
  r05: unsplash('photo-1524368535928-5b5e00ddc76b', 720, 480),
  r06: unsplash('photo-1543007630-9710e4a00a20', 720, 480),
  r07: unsplash('photo-1511882150382-421056c89033', 720, 480),
  r08: unsplash('photo-1533174072545-7a4b6ad7a6c3', 720, 480),
};

/** @param {Record<string, string>} group */
function entries(group, folder) {
  return Object.entries(group).map(([name, url]) => ({ file: `${folder}/${name}.jpg`, url }));
}

const MANIFEST = [
  ...entries(PORTRAITS, 'portraits'),
  ...entries(COVERS, 'covers'),
  ...entries(POSTS, 'posts'),
  ...entries(ROOMS, 'rooms'),
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function download(entry) {
  const target = join(ROOT, 'assets', 'media', entry.file);
  if (await exists(target)) {
    return 'skipped';
  }
  await mkdir(dirname(target), { recursive: true });

  const response = await fetch(entry.url);
  if (!response.ok) {
    throw new Error(`${response.status} ${entry.url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 2_000) {
    throw new Error(`suspiciously small (${bytes.length} bytes) ${entry.url}`);
  }
  await writeFile(target, bytes);
  return `${Math.round(bytes.length / 1024)}KB`;
}

let failed = 0;
for (const entry of MANIFEST) {
  try {
    const result = await download(entry);
    console.log(`${result.padEnd(8)} ${entry.file}`);
  } catch (error) {
    failed += 1;
    console.error(`FAILED   ${entry.file}: ${error.message}`);
  }
}

console.log(`\n${MANIFEST.length - failed}/${MANIFEST.length} files in assets/media`);
process.exitCode = failed > 0 ? 1 : 0;
