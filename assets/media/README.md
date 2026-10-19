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
