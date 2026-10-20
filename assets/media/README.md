# Test media

**Every file in this folder is placeholder content for development, not product
art.** The app ships with it so screens can be reviewed against real photography
— crops, contrast, text over image, faces in a list — instead of colour blocks.
Replace them with the real assets when they exist.

## What lives here

| Folder        | Files            | Used by                                            |
| ------------- | ---------------- | -------------------------------------------------- |
| `portraits/`  | `f01..f12` (12)  | Avatars, `f` = female, `m` = male, `self` = me      |
|               | `m01..m12` (12)  |                                                     |
|               | `self`           | The signed-in member, shown on the Me tab           |
| `covers/`     | `f01..f03`, `m01..m04` | Profile hero covers                          |
| `posts/`      | `f01..f06`, `m01..m02` | Moment media                                 |
| `rooms/`      | `r01..r08`       | Room card artwork                                   |
| `frames/`     | 5 files          | Avatar frames the project owner drew; see below     |
| `art/`        | see below        | Generated decoration; not photography               |

Portraits are 256×256, covers 720×1280, posts 600×800 and room covers 720×480.

## Where the photography came from

- **[Unsplash](https://unsplash.com)** — the [Unsplash
  License](https://unsplash.com/license) grants free use, including commercially,
  with no attribution required and no permission needed. Files are fetched
  through the Unsplash image CDN with `crop=faces` so portrait crops keep the face
  in frame.
- **[pravatar](https://pravatar.cc)** — community test portraits, used for the
  slots where a face was needed without picking a specific Unsplash photo.

The characters these photos show are **not** the people the fixtures describe.
Every fixture member is invented; the name, gender, level and status are
generated (see `src/core/data/fixtures.ts`). Names, covers and portraits are
grouped by the gender the photo presents only so a row cannot read as an obvious
mismatch while reviewing the layout.

## The avatar frames

`frames/` holds five frames drawn by the project owner specifically for this app:
`blossom`, `wings`, `heart`, `rope` (still) and `halo` (animated). The originals
live outside the repo in the owner's `Sprites/` folder; the copies here are the
production versions:

- every still is a **512×512 PNG** with a fully transparent centre hole;
- `halo.webp` is animated — 61 frames at 60 ms, 320×320, alpha preserved. It is
  bundled as WebP rather than GIF because the GIF encode either lost the
  transparency or ballooned past 3 MB; the WebP is 1.4 MB with clean edges.

`src/core/media/images.ts` stores the fit of each frame to the photo it wraps —
**canvas side ÷ hole diameter** plus the **offset of the hole's centre from the
canvas centre**, both measured from the art's alpha channel:

| frame | scale | offset (x, y) |
|---|---|---|
| `blossom` | 1.323 | +0.0098, −0.0303 |
| `wings` | 1.463 | 0, −0.0312 |
| `heart` | 1.340 | 0, −0.0469 |
| `rope` | 1.219 | 0, 0 |
| `halo` | 1.905 | 0, 0 |

The offsets matter: the heart and the blossoms hang off the bottom of the ring,
so their hole sits *above* the canvas centre. Drawing the art centred on the
photo would leave a gap under the chin and clip the hair. `Avatar` scales the art
and nudges it by the offset so the hole lands exactly on the photo at any size.
Re-measure with the alpha-channel scan described in ADR 0004 (P5) if the art is
ever redrawn.

**Only `halo` animates, so only one avatar may wear it at a time.** The fixtures
give it to the account's own avatar on the Me tab and never to a directory row,
a post or a conversation: sixty frames of alpha in a scrolling list is work the
device should not do for decoration.

## Regenerating

```sh
npm run media:fetch   # downloads anything missing; safe to re-run
npm run art:build     # re-renders the SVG sources in assets/art to PNG
```

`media:fetch` skips files that already exist, so it will not overwrite
replacements. Delete a file (or the whole folder) to fetch it again.

## The generated art

`art/` holds our own decoration, authored as SVG in `assets/art/` and rasterised
by `tools/build-art.mjs` with `@resvg/resvg-js`:

| File               | What it is                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `crest.png`        | The profile medal: gold laurel, rose enamel, a gem at the foot     |
| `avatar-frame.png` | The gold avatar ring with four rose gems                           |
| `wing-heart.png`   | The winged heart on the couple card                                |
| `clouds.png`       | The cloud band behind the couple card                              |
| `honor-panel-*.png`| The three honour walls' plates, gold/violet/ice, light + `-dark`   |
| `honor-medal*.png` | The medallion a badge glyph sits in (light + `-dark`)              |
| `honor-gift-frame*.png` | The plaque a gift glyph is framed by (light + `-dark`)        |

The honour plates share one shape in three tones: a metal double border, filigree
sprigs in the corners and a glass shelf near the foot that the trophies stand on.
The wall's *title plaque* and *count chip* are deliberately not baked into the
art — they carry text, so the screen draws them and they stay translatable and
mirrored in RTL.

These are original shapes drawn from our own palette — no reference-app art is
copied or cropped. The enamel in the crest is deliberately empty: `ProfileEmblem`
draws the member's own honor glyph into it.

Edit the shapes in `tools/build-art.mjs` and re-run `npm run art:build`; the SVG
it writes to `assets/art/` is the readable source of truth for each piece.

## Wiring

Screens never import from this folder. The data layer stores opaque references
(`asset:media/portraits/f01.jpg`) and `src/core/media/images.ts` is the single
place they are resolved to bundler ids. A backend can return an `https://` URL
through the same field and no screen changes.
