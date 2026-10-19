# 0004 — App shell + design system (P3)

**Date:** 2026-10-18
**Status:** DONE — implemented, all repo checks passing, and rendered on a physical device. Reworked for reference fidelity in [P3.1](#p31--reference-fidelity-pass-2026-10-19).
**Phase:** P3 — application shell and design system

## Decisions

1. **Data comes from fixtures behind a typed repository seam**, not a mock HTTP
   server. Screens import a `DataSource` interface, so swapping in the real API
   later is a one-file change and no screen learns about `fetch`, JSON, or
   endpoints. Chosen over a fake HTTP layer because it keeps the type contract
   first-class and adds no server process to the dev loop.
2. **One custom bottom tab bar for every platform** (`AppBottomTabs`, built on the
   headless `expo-router/ui`), replacing the previous split
   `app-tabs.tsx` (native `NativeTabs`) + `app-tabs.web.tsx`. One implementation
   means the bar looks the same everywhere and gives us direct control over
   badges, RTL placement and safe-area padding — which `NativeTabs` does not.
   Navigation semantics (state preservation, deep links, back) still come from the
   router.
3. **RTL is structural, not forced.** Layout uses logical properties (`start`/
   `end`, `flexDirection: 'row'`) and text is left to the platform's bidi
   handling. On top of that, `src/core/i18n` exposes `isRTLLanguageText` /
   `textAlignFor` for the places that genuinely need a decision (for example a
   mixed Arabic/Latin list). We do **not** set `I18nManager.forceRTL`, which is a
   restart-requiring global toggle and would fight the web build.
4. **Overlays are explicit primitives** (`BottomSheet`, `ConfirmDialog`,
   `ActionMenu`, `Toast`) rather than ad-hoc modals, so payment, privacy and
   destructive actions always go through a labelled, cancellable surface.

## Route tree

```text
src/app/_layout.tsx           <Stack>  root: ErrorBoundary > SafeAreaProvider
                                        > ThemeProvider > ToastProvider
src/app/(tabs)/_layout.tsx    <AppBottomTabs/>  (reads the unread total)
src/app/(tabs)/index.tsx      Home       /
src/app/(tabs)/moments.tsx    Moments    /moments
src/app/(tabs)/rooms.tsx      Rooms      /rooms
src/app/(tabs)/messages.tsx   Messages   /messages
src/app/(tabs)/me.tsx         Me         /me
src/app/dev/rtc-spike.tsx     dev harness  /dev/rtc-spike  (pushed on the root stack)
```

`SafeAreaProvider` is mounted **explicitly** because the toast host and the modal
overlays render outside the navigator and still need inset values.

## Data seam

`src/core/data/types.ts` — domain types: `UserSummary`, `RoomSummary`,
`ConversationSummary`, `MomentPost`, `MembershipSummary`, `Page<T>`, and the
mode unions (`PeopleMode`, `RoomMode`, `RoomRelationshipFilter`, `MomentsMode`,
`ConversationFilter`, `ContactsFilter`, `MessagesTab`).

`src/core/data/repository.ts` — the `DataSource` contract plus
`fixtureDataSource`. `devControls` is the deliberate test hook:

| Knob | Purpose |
|---|---|
| `latencyMs` | Exercises loading states in the simulator (set to `0` in tests) |
| `failReads` | Rejects the next *N* reads, to exercise error + retry paths on demand |

`src/core/data/fixtures.ts` — seeded, deterministic fixtures with mixed Arabic and
Latin names. They ship **no image URLs on purpose**, so `Avatar`/`MediaThumb`
render deterministic colour blocks and review needs no external image host.

## Design tokens

`src/constants/theme.ts` keeps the existing light/dark `Colors` (additive only —
`ThemedText`/`ThemedView` depend on the original keys) and adds:

- `RoomPalette` — live-room surfaces. Deliberately **not** scheme-aware: a room is
  always dark.
- `PremiumPalette` — membership surfaces with metallic rank accents.
- `Radius`, `TouchTarget` (44pt minimum), plus the existing `Spacing`.
- `Tints` — per-tab washes, chip tints and rank gradients, keyed by colour scheme
  and resolved with `useTints()`. Deliberately kept **out of** `Colors`:
  `ThemedText`'s `themeColor` indexes `Colors` with flat string keys, so nested
  tint groups there would widen that type for no benefit.
- `CardShadow` — the elevation shared by the white cards.

## Primitives

`src/components/ui/`: `icon`, `app-screen`, `screen-gradient`, `app-card`,
`back-header`, `divider`, `app-button`, `icon-button`, `floating-action`,
`avatar`, `media-thumb`, `badge`, `age-pill`, `tier-badge`, `level-emblem`,
`hi-button`, `category-chip`, `tag-chip`, `segmented-tabs`, `filter-chips`,
`menu-row`, `states` (loading / empty / error / locked), `bottom-sheet`,
`confirm-dialog`, `action-menu`, `toast`.

Feature components: `app-bottom-tabs`, `people-row`, `room-card`,
`conversation-row`, `moment-card`, `promo-banner`, `user-badges`.

Hooks: `useAsync`, `usePaginated`, `useReducedMotion`, `useTheme`, `useTints`.

## Notable implementation points

- **Keyed async state.** Both data hooks identify a request by a string `key` and
  tag the stored result with it. A stale response can never be mistaken for the
  current one, so switching segments quickly cannot show old data — and no
  synchronous state reset is needed inside an effect. This also satisfies the
  modern `react-hooks` rules (`set-state-in-effect`, `refs`), which the first
  draft of the hook violated.
- **A failed follow-up page never blanks the list**, and pull-to-refresh replaces
  the first page without clearing what is on screen.
- **Optimistic likes with rollback.** `Moments` applies a like immediately,
  reconciles against what the data layer confirms, and restores the previous value
  if the request fails.
- **Reduced motion is read, not assumed.** `useReducedMotion` feeds the modal
  `animationType`, so sheets switch to an instant transition when the OS asks.
- **Out-of-scope controls are honest.** Header actions and row taps that belong to
  later phases raise a toast ("… arrives with the backend phase") rather than
  navigating nowhere or silently doing nothing.
- **Icons: one per file, referenced by meaning.** `icon.tsx` maps a closed
  `IconName` union ("search", "greeting", "rank") onto Lucide's thin-stroke
  outline set (`lucide-react-native`, ISC), rendered through `react-native-svg`.
  Screens never name a glyph, so the set stays swappable, and the reference app's
  iconography — which is protected trade dress — is never copied. Icons are
  imported one file at a time rather than from the package root; the reasons are
  in the module comment and in P3.1 below.
- Removed the now-unreferenced scaffold leftovers `hint-row.tsx`, `web-badge.tsx`,
  `external-link.tsx`, and `ui/collapsible.tsx`.
- `jest.config.js` maps `\.css$` to a stub, because `theme.ts` imports the
  web-only `global.css`. Tests use the **async** Testing Library API (RNTL 14:
  `await render`, `await fireEvent.press`, `await renderHook`).

## Verified (evidence)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS — strict, 0 errors |
| `npx eslint .` | PASS — 0 errors, 0 warnings |
| `npx prettier --check` | PASS |
| `npx jest` | PASS — **71/71** across 7 suites |
| Repository seam contract (pagination, cursors, filters, banner interleaving, like reconciliation + idempotency, simulated failures) | PASS — `src/core/data/repository.test.ts` |
| Hook state machine (append, cursor exhaustion, failed page keeps items, error + retry, refresh in place, **superseded key ignored**) | PASS — `src/hooks/use-async.test.tsx` |
| Formatting helpers: compact counts, bucketed distance, relative time, emoji flags | PASS — `src/core/format/format.test.ts` |
| RTL detection | PASS — `src/core/i18n/i18n.test.ts` |
| Component behaviour: accessible row label, Arabic monogram, bucketed distance, age pill, greet-vs-open routing | PASS — `src/components/people-row.test.tsx` |
| Badge cluster: omits an unknown level, numbers a known tier, and the `status` variant holds paid ranks back | PASS — `src/components/user-badges.test.tsx` |

## On-device pass (2026-10-19)

Run on the same Xiaomi/Android 14 device as [0003](0003-android-toolchain-and-local-rtc.md),
against Metro, by reading the accessibility/UI hierarchy with
`uiautomator dump`. This matters because the checks above are static or
unit-level — they say nothing about whether the layout actually renders.

| Screen | What the device actually showed |
|---|---|
| Home `/` | "Discover / People near you and beyond", the 4 mode tabs (Recommend, Nearby, New, Featured), people rows carrying name + **real level** + badges (VIP, SVIP, AR, NEW) + status + locale + distance, and **promo banners interleaved** between rows |
| Rooms `/rooms` | The 5 directories (Recommend, Video, New, Me, Global), room cards with title, description, category chip, country chip, host + level, and participant counts **sorted descending** (478, 453, 424, …) as the data test asserts |
| Moments `/moments` | Recommend/New, post cards with author, level and badges, body text, relative time, and like/comment counters |
| Messages `/messages` | Messages/Contacts pill tabs, the filter chips (All, Online, Most Chatted, Unread), the dismissible notification prompt, and conversation rows with unread counters |
| Me `/me` | Identity, the Following/Fans/Followers metrics, the Recharge card, the three membership tiers with status, and the General tools rows |
| Tab bar (every screen) | All five destinations with labels, plus a live unread badge **37** on Messages sourced from the repository — not hard-coded |
| Runtime | `fabric: true` (**New Architecture** active) and **zero JS errors** in `logcat` |

All five routes were reached by deep link (`letgo:///rooms` etc.) rather than by
tapping, because MIUI still blocks host-side input injection (see 0003).

### Defect found by the device pass, and fixed

Only one, and the unit tests could not have caught it: **every Moments card
rendered `Lv 0`.** `MomentPost` had no author level, so `UserBadges` fell back to
`formatLevel(0)`. Fixed by (a) giving a post its author's real level and badges —
derived from the same user record, so the two can never drift — and (b) making
`UserBadges` omit a level badge entirely when no level is known, since `Lv 0` is
worse than no badge. Both are now pinned by tests.

## NOT verified

- **iOS.** Cannot be built on Windows; needs a Mac.
- **Interactive flows** (tab switching by tap, likes, pull-to-refresh, sheet
  open/close) — the device pass proves rendering and data wiring, not gestures.

## Deliberately NOT in P3

- Any backend, auth, or persistence.
- The live-room screen itself (P4/P5). `dev/rtc-spike` is still the only RTC UI and
  is deleted once the real room lands.
- Profile, chat thread, search-results, and room-details screens — the features
  that P3's rows point at.
- A real icon set (see above) and a locale catalogue (only direction helpers exist;
  copy is still inline English).

## P3.1 — reference-fidelity pass (2026-10-19)

**Status:** done. Static checks green, the native app rebuilt for the icon set's
new native module (`react-native-svg`), and every screen below re-verified on the
physical device.

After P3 landed, all 100 reference screenshots were re-read against the built
screens. P3 had reproduced the *information* but not the *composition*: it used a
large page title, a card per row, and pills everywhere, where the reference uses
a titleless mode row, flat divided lists, white elevated cards on some surfaces
and a hue-matched wash per tab. P3.1 closes that gap.

### What now matches

| Element | Reference anatomy | Implementation |
|---|---|---|
| Header | Mode tabs + action icons, **no page title** | `SegmentedTabs` in a `flex: 1` row beside `IconButton`s. `ScreenHeader` was deleted: a large title is not part of this design. |
| Active mode | Bold label with a short curved mark beneath it | `SegmentedTabs` — 17px bold, a 30pt arc drawn as a wide view whose rounded bottom border curves it |
| Screen wash | A per-tab gradient fading to white | `ScreenGradient` (svg) driven by `AppScreen`'s `tint`, colours from `Tints` |
| Person row | 56–70px avatar + presence dot; name + gold level crest; pink age pill with the rank pill beside it; `166km ·` + status; pink **Hi** pill with a heart | `PeopleRow` with `AgePill`, `LevelEmblem`, `HiButton` and `UserBadges variant="status"` — the status variant holds paid ranks back so the caller can place them next to the age pill |
| Room card | ~86px cover; title + level crest; description; tinted category chip; audio-bars + participant count | `RoomCard` (list and grid), `CategoryChip`, `MediaThumb` |
| People feed | A promoted card interrupts the list — it never leads it | The `DirectoryFeedItem` union, rendered by the same list |
| Room directory | An event card sits **above** the rooms, and above the video grid | The `RoomFeedItem` union: the banner is the first feed item and renders through `ListHeaderComponent` |
| Moments / Messages rows | Flat rows separated by a hairline, not cards | `ItemSeparatorComponent={Divider}` |
| Notifications prompt | Purple banner with an action and a dismiss control | Tinted banner in `messages.tsx` |
| Bottom bar | White, hairline top border, active icon in a hue-matched tinted rounded square, `99+` badge | `AppBottomTabs` |

### Deliberately not copied

Branding, copy, artwork, photography and logos. No reference image is shipped,
linked or reproduced: avatars and room covers are still deterministic colour
blocks, flags are emoji rendered from an ISO code, and every icon comes from
Lucide. What is matched is layout, proportion and hierarchy — never trade dress.

### Deliberate deviations

- **Rooms keeps five mode tabs** (Recommend / Video / New / Me / **Global**). The
  reference reaches its regional directory from a region selector that does not
  exist yet, and publishing the route now would open a screen with nothing to
  select. Making `Global` a pushed screen is deferred to the phase that adds the
  selector.
- **Messages shows four filter chips** (All / Online / Most Chatted / Unread). The
  reference shows a fifth ("Favourites"), which the inbox has no model for.
- **The last mode tab can sit just off-screen.** The mode row scrolls, so Home's
  *Featured* and Rooms' *Global* are reached with a swipe rather than being
  visible. Three header actions at the 44pt minimum touch target leave 233dp for
  the tabs, and a reference-sized label row needs about 254dp. The reference fits
  because its header controls are far smaller than 44pt; ours cannot be, so the
  row scrolls — exactly as the reference's own row does. The upside of the
  narrower labels is that no tab is ever chopped mid-word.

### Notable implementation points

- **Per-tab tints stay outside `Colors`.** `Tints` is keyed by scheme and resolved
  by `useTints()`, so adding a tint can never widen the flat `themeColor` union
  that `ThemedText` indexes.
- **Gradients cost no extra dependency.** `react-native-svg` was already needed by
  the icon set, so the washes are drawn with `ScreenGradient` rather than adding
  `expo-linear-gradient`.
- **Icon names are type-checked.** `ICONS` is a total `Record<IconName,
  LucideIcon>`, so a screen cannot ask for an icon that does not exist and a
  Lucide rename breaks `tsc` instead of the UI.
- **Icons are imported per file.** The package root is a single ~250 kB index of
  ~1,700 icons, and in the installed version (`lucide-react-native@1.59.0`) it
  re-exports files its own dist does not ship (`waves.mjs`, `smile.mjs`), which
  makes it unresolvable in Metro. Importing `lucide-react-native/icons/<name>`
  pulls in only what is used and only files proven to exist; the two missing
  glyphs were replaced with their current names (`FaceSlightlySmiling`,
  `WavesHorizontal`).
- **Jest stubs Lucide.** Lucide ships ESM and its CommonJS build costs ~400 kB of
  Babel work per run, so `jest/lucide-mock.js` renders an inert view. Icon names
  are still guaranteed by `tsc` against Lucide's real types, and the app itself
  uses the real library.

### Verified on device (2026-10-19)

Rebuilt arm64-v8a, reinstalled (`adb install -r`) and driven through all five
tabs by deep link, with the UI tree and screenshots read back each time.

| Check | Result |
|---|---|
| All five tabs render the reworked layout | PASS |
| Icons and both gradient washes draw (i.e. the new native module is linked) | PASS |
| Zero JavaScript errors in the app's own log across the pass | PASS |
| People rows show the level crest, age pill, distance and greeting control | PASS |
| Room feed leads with the promoted card, and the video grid keeps its columns | PASS |
| RTL rows (Arabic names and status lines) lay out correctly | PASS |
| Bottom bar badge and account dot come from the data layer | PASS |
| Dark scheme (the device is set to dark) | PASS |

### NOT verified in P3.1

- **Mute / unmute / leave on a real call.** These need taps on the phone, and the
  handset blocks injected input (MIUI's *USB debugging (Security settings)* is
  off, so `pm grant` and `INJECT_EVENTS` both fail). Everything up to the tap is
  exercised.
- **Two-person audio.** Needs a second participant; the `lk` bot publishes
  synthetic media only.
- **iOS.** Cannot be built on Windows.
- **Light scheme on device.** The washes and tints are scheme-keyed and the light
  values are reviewed, but the handset was left in dark mode for this pass.

---

## P4 — public profile (2026-10-19)

**Scope:** one page, `src/app/person/[id].tsx`, against reference screens 001 and
018 / 021–028. Everything else in the app is untouched except where the new page
had to be made reachable from it.

### Decisions

- **The page is reachable from every surface that shows a member.** People rows
  (Home), contact rows (Messages), post authors (Moments) and post authors inside
  the profile's own Moments tab all push the same route. The three "the profile
  for X arrives later" toasts those rows used to raise are gone — they were dead
  ends, which is what this pass exists to remove.
- **One growth path for the header.** The cover scrolls away and a compact header
  fades in over it, driven by `react-native-reanimated`'s
  `useAnimatedScrollHandler` rather than React Native's `Animated`. Two reasons:
  the repo already animates with Reanimated (`animated-icon.tsx`), and staying on
  the UI thread means the fade costs no JS frames. `runOnJS` fires only when the
  offset crosses the compact threshold — `compact` gates hit testing and the
  accessibility tree, neither of which needs a per-frame update.
- **The section strip is genuinely pinned.** `stickyHeaderIndices` is used because
  four separate captures of the same profile (023–026) show the strip at an
  identical offset under the compact header; if it merely scrolled, four different
  tabs would not agree to the pixel.
- **The data seam grew two methods, not a new seam.** `getProfile(userId)` returns
  a `UserProfile`, and `sendGreeting(userId)` returns the confirmed greeting state
  — the same contract as `setMomentLiked`. A greeting is a server fact, so the
  button reports what the response said, never what the user tapped.
- **Profile fixtures are derived from the directory fixtures.** Names, avatars,
  levels, ages, genders and badges are *the same objects* the directories render,
  so a row can never open a profile that contradicts it. Profile-only values come
  from a separate PRNG stream (`20261020 + index`) precisely so that adding
  profile data cannot shift a single value the existing directories generate.
- **Copy is real.** `expo-clipboard` was added and the app rebuilt, because the
  alternative was an ID row with a copy icon that cannot copy. This is the only
  dependency this page added.
- **`Tints.gender` replaces a duplicated constant.** The male/female glyph tint was
  a `MALE_TINT` literal in both `people-row.tsx` and `moment-card.tsx`; the profile
  needs the same tint, so it moved into the scheme-keyed tint set.

### Deliberately not copied

- **The honour walls' ornate art.** The reference frames each wall with metallic
  badge, title and gift artwork. That is proprietary art, so the framing here is a
  flat tinted panel with a bordered title plate, and every trophy is one of our own
  glyphs. What is reproduced is the structure the analysis calls out: a titled
  wall, a preview row, a count that opens the full collection, and empty
  placeholder slots.
- **The family crest and badge crest imagery**, replaced with our own `rank` and
  `diamonds` glyphs and a text label. *(Superseded in P4.1: the reference's floating
  crest is now reproduced as a flat tinted emblem, and the stat row names charm,
  wealth, tier and agency instead of level and family.)*
- **The minimised live-room widget** that floats over the cover in screen 001. It
  is bound to a live room session, and no session exists yet — rendering it now
  would be a control with nothing behind it. It belongs to the room phase.
- **The unlabelled decorative chips beside the name** in screen 001. Their meaning
  cannot be determined from the capture, and inventing one would be worse than
  omitting them. The chip row is built from data we actually hold: age, level,
  rank and family. *(Superseded in P4.1: the chips are age, charm, wealth, tier and
  agency, which is what the capture actually prints — see P4.1.)*

### Deliberate deviations

- **The strip pins below the compact bar rather than the bar overlapping it.** The
  reference's collapsed state puts both in one block; ours reserves the bar's
  height in the sticky block and pulls it back with an equal negative margin, which
  produces the same pinned layout *and* the same unpinned spacing without a
  layout-animating header.
- **Nationality and address are country-level only** (`Nationality Morocco`,
  `Current Address Morocco`), matching the privacy rule the directory rows already
  follow. Neither field ever carries a precise location, and a test asserts the
  address row contains no digits.
- **The Moments tab reuses the shared `MomentCard`.** The reference draws a
  narrower, left-aligned post on the profile than in the feed. Reusing the one card
  keeps a single post rhythm across both surfaces and avoids a second variant of
  the component that would drift from the first.
- **Call, Message, honour collections, relationship detail and invite, report and
  block** raise a "arrives in a later pass" toast. They are not faked, and none of
  them implies a server state change.

### Notable implementation points

- **The sticky offset arithmetic.** The strip's block has `paddingTop: insets.top +
  COMPACT_BAR_HEIGHT` and `marginTop: -COMPACT_BAR_HEIGHT`. Unpinned, the two cancel
  and the strip sits `insets.top` below the identity block, matching the reference;
  pinned, the block starts at zero and the strip lands exactly below the compact
  bar. The block itself stays transparent in its padding band, so the identity
  scrolls out from under it rather than being clipped by it.
- **Empty states are exercised by the fixtures, not by a code path nobody runs.**
  Roughly a third of members have no couple, some have no friends, and the titles
  wall is empty for about a third of them — so the Relationships empty state and
  the placeholder trophy slots render with real data.
- **Accessibility.** Age, level, rank and family each carry their own label; the
  copy control is a full 44pt target named after what it copies; empty trophy slots
  are hidden from assistive technology so "Empty" is never announced as a control;
  and the invisible compact overlay removes itself from hit testing *and* the
  accessibility tree until it is actually visible.
- **Likes reconcile to the server.** The profile's posts are the same objects the
  Moments feed renders, so a like confirmed on one surface is visible on the other;
  the optimistic value is replaced by the confirmed counts, and rolled back on
  failure.

### Verified on device (2026-10-19)

Rebuilt arm64-v8a (the `expo-clipboard` native module is new), reinstalled with
`adb install -r`, and driven through the page by deep link, reading the UI tree
and a screenshot back at each step.

The handset refuses input injection (`INJECT_EVENTS` is not granted to the shell,
and MIUI will not grant it), so taps and scrolls cannot be synthesised. The page
was therefore driven by a **temporary, deep-link-only harness** — read `tab`,
`scroll`, `fail` and `copy` from the URL, then set the tab, scroll with
Reanimated's `scrollTo`, fail the next read, or fire the copy control. It was
removed before this commit; the tree is clean of it.

| Check | Result |
|---|---|
| All four sections render with real fixture data — About, Honor, Moments, Relationships | PASS |
| The section strip stays pinned under the compact header while the body scrolls beneath it | PASS |
| The compact header cross-fades in over the scrolled cover, and lands the strip exactly below itself | PASS |
| Shortcuts, tags and the full information stack render (ID, height, weight, occupation, nationality, address, birthday, constellation, registration) | PASS |
| The ID copy control writes to the clipboard — the toast reports the copied value, i.e. the success branch, not the failure branch | PASS |
| Relationships renders a couple plus friends *and*, for a member with neither, the empty state | PASS |
| The error path renders `Profile unavailable` with a "Try again" control | PASS |
| Structural RTL: the Arabic signature right-aligns, the Latin one left-aligns | PASS |
| Gender, level, family and VIP tier each take their own tint; the online dot and verified badge draw | PASS |
| Heading, tab strip, bodies and the action bar all survive a cold start (no stale bundle) | PASS |
| Dark scheme (the device is set to dark) | PASS |

### NOT verified in P4

- **A literal finger tap on the copy row.** The handler ran, the native module
  resolved and the clipboard write reported success, but the touch itself cannot
  be synthesised on this handset. The same applies to every other control on the
  page: they are verified as rendered, labelled and wired, not as pressed.
- **Light scheme on device**, unchanged from P3.1 — the handset stays in dark mode.
  *(Closed in P4.1: the handset was switched to light for the fidelity pass and both
  schemes were verified end to end.)*
- **iOS.** Cannot be built on Windows.

## P4.1 — profile fidelity pass (2026-10-19)

**Scope:** the same page, re-measured against reference screens 001 / 027 (top of the
profile) and 023–026 (the scrolled states). No route, no data method and no other
screen changed.

The first pass matched the page's *sections* but not its proportions. Reading the
captures again at their true scale showed three structural gaps: the cover was 0.22
of the screen where the reference gives it 0.54; the identity carried a 68dp avatar
the reference does not have; and the chip row named data the reference does not print
(level, family) while omitting what it does (charm, wealth, agency).

### What changed

- **The cover is a photo-first hero.** Its height is derived from the window (54%,
  clamped to 320–520dp) instead of a 190dp constant, which is what makes the page read
  like the reference before any scrolling.
- **The member's photos replace the overlapping avatar.** Two framed thumbnails sit at
  the cover's bottom-left, as in the reference's album strip. The first one *is* the
  compact header's avatar — same id, same placeholder colour — so the collapsed
  identity cannot disagree with the strip the user just scrolled past.
- **The crest floats at the end of the identity block**, overlapping the name and
  presence rows, as an owned decoration drawn flat from the tier/age tints and our own
  glyph set.
- **The chip row is age · charm · wealth · tier · agency**, which is the set the
  reference prints. Charm and wealth got their own tint keys and the agency a
  dedicated two-part chip (figure + wordmark).
- **Controls are bare, with the scrim on the surface.** The reference draws white
  glyphs straight on the photo; `OverlayButton` is now unfilled, and the cover paints a
  soft top gradient (new `opacity` on `ScreenGradient`) so white still clears the
  contrast floor over any art.
- **Shortcut tiles lead with a thumbnail**, not a glyph, and the family tile carries
  the verified check.
- **"Profile Tags" and "Information" are quiet grey labels**, not bold headings, and
  the copy glyph now sits immediately after the ID value instead of at the row's far
  edge.
- **The post card matches the profile's post rhythm.** Age and tier chips stack under
  the author's name (the name no longer repeats a gender glyph), media is a portrait
  inset rather than a full-bleed banner, and `MomentPost` grew `hashtag`, `hasMedia`
  and `authorVipTier` so the layout is data-driven rather than fabricated in the view.
- **The invite tile is filled**, like the reference's, not a dashed placeholder.
- **The section strip lost its hairline.** The reference separates it by spacing
  alone; the rule drew a second line above the section body.
- **Both schemes were verified.** The handset was switched to light for this pass
  (the references are light), which also closes the light-scheme gap from P3.1/P4.

### Deliberate deviations (new)

- **The cover, thumbnails and post images are deterministic colour blocks.** We ship
  no photographs and will not reuse the reference's subjects. They are the same
  `MediaThumb` / `Avatar` placeholders every directory row already uses.
- **The crest is flat.** The reference's is an enamel medal; ours is concentric tinted
  rings around one of our glyphs. Mass and position match; the art does not.
- **Album thumbnails raise a "photo viewer arrives in a later pass" toast.** There is
  no viewer yet, and a thumbnail that does nothing would be a dead end.

### Verified on device (2026-10-19, light and dark)

Driving still needs the temporary deep-link harness (the handset denies input
injection), removed before this commit.

| Check | Result |
|---|---|
| Cover occupies ~54% of the window at rest, with the album thumbnails at its bottom-left | PASS |
| White back/share/more glyphs stay legible over the scrimmed cover | PASS |
| Identity: name + verified badge, presence, five-chip row (age, charm, wealth, VIP, agency), crest at the end | PASS |
| A member with no tier/agency renders the shorter chip row without gaps | PASS |
| Shortcut tiles show thumbnails, member counts and the family check | PASS |
| Tags keep emoji-first pills; "Profile Tags" / "Information" are quiet grey labels | PASS |
| Info rows: mutual-followers row first, copy glyph beside the ID value | PASS |
| About body: the Arabic signature right-aligns, the Latin one left-aligns | PASS |
| Moments: chips stacked under the name, portrait media inset, `#` chip, footer counts | PASS |
| Honor: three titled walls with counts, entries and empty slots | PASS |
| Relationships: couple panel, friend cards and the filled invite tile | PASS |
| Relationships empty state for a member with no records | PASS |
| Compact header fades in over the scrolled cover | PASS |
| Light scheme end to end | PASS |
| Dark scheme end to end | PASS |

### NOT verified in P4.1

- **Literal taps** — unchanged: `INJECT_EVENTS` is denied, so controls are verified as
  rendered, labelled and wired, not as pressed.
- **A scrolled state held by a real finger** — the offset was driven by the harness.
  The fade is the same Reanimated interpolation either way.
- **A two-digit agency rank at the smallest font scale** — the chip is measured at the
  default scale only.
- **iOS.** Cannot be built on Windows.

## P4.2 — relationships cards and real test media (2026-10-19)

**Scope:** the profile's Relationships tab, and every surface that shows an image.
No route, no data-method signature and no other screen's layout changed.

Two things drove this pass. The reference keeps the couple card and the friend row on
screen whether or not the member has any relationship — the cards *are* the empty
state — and a UI reviewed against colour blocks cannot answer the questions the layout
actually raises: does white text clear a real photo, does a face survive the cover crop,
does the strip balance against a busy background.

### What changed

- **The Relationships tab has no empty state.** The couple card always renders, and with
  no couple its second slot is the invitation; the friend row always renders and always
  ends in the invite tile. A member with nothing yet sees two live affordances instead of
  a message. `CouplePanel` gained the art backdrop, the framed pair and the invite slot;
  the friend cards gained the peer's photo.
- **The app renders real photography.** `assets/media/` holds placeholder photos fetched
  by `tools/fetch-test-media.mjs` — 24 portraits, 7 profile covers, 8 post images and 8
  room covers — and the fixtures point at them. Everything is test content with a
  permissive licence, documented in `assets/media/README.md`, and meant to be replaced.
- **The decoration is generated, not borrowed.** `tools/build-art.mjs` authors four
  pieces as SVG (crest, avatar frame, winged heart, cloud band) and rasterises them with
  `@resvg/resvg-js` into `assets/media/art/`. The SVG sources stay in `assets/art/` so
  the shapes remain editable. Nothing is cropped from the reference app.
- **Images resolve in one place.** The data layer stores opaque references
  (`asset:media/portraits/f01.jpg`); `src/core/media/images.ts` is the only module that
  turns one into a bundler id, and anything it does not recognise is treated as a remote
  URL. A backend can return `https://` through the same fields and no screen changes.
  `Avatar` and `MediaThumb` accept either.
- **The fixtures are internally coherent.** Gender is now decided first, and the name,
  the pronouns the profile derives from it, the portrait, the cover and the post images
  all follow from that one choice; the inbox peers, moment authors and relationship
  records are copies of the same `UserSummary` objects the directories render, so a
  member's face cannot differ between two screens. This also removed a latent defect: the
  inbox previously paired a peer id with an unrelated name from a flat pool.
- **`FramedAvatar` is a new primitive**, and `tints.couple` a new token group, so the
  rose card and its ring art vary correctly between schemes rather than being hard-coded.
- **The couple card's cloud band stays in its upper band.** The art is near-opaque white,
  so it is placed in the top 72%, stretched to the card's edges and weakened in the dark
  scheme; a rose floor gradient sits under the names. White labels on white clouds was the
  first defect the handset showed, in both schemes.
- **The crest is now the generated medal.** `ProfileEmblem` keeps its structure — a large
  crest beside the name carrying the member's honor glyph — but the medal is art rather
  than concentric tinted rings.
- **The cover wash only stands in for a missing photo.** Over photography it would flatten
  the subject, so the top scrim is the only overlay then.
- **Jest mocks `expo-image`** (`jest/expo-image-mock.js`): its native work escapes `act()`
  and leaks between tests. Nothing under test asserts on image internals.

### Deliberate deviations (new)

- **The photos are placeholders and do not depict the fixture members.** They exist to
  exercise crops, contrast and density, and every one is expected to be replaced. They
  are grouped by the gender the photo presents purely so a row does not read as an
  obvious mismatch while reviewing layout.
- **Eight room covers are shared across eighteen rooms.** The room list is reviewed for
  rhythm, not for eighteen distinct photographs.
- **The friend cards wear the same ring as the couple card.** The reference decorates both;
  the art is the app's own rather than a copy of the reference's frame.

### Verified on device (2026-10-19, light and dark)

Xiaomi 24117RN76G (1080×2400, 393dp, Android 14), Metro over `adb reverse`. This handset
denies `INJECT_EVENTS`, so every screen was reached by deep link, and the profile's section
and scroll offset were driven by a temporary `?tab=` / `?scroll=` harness that was removed
before committing.

| Check | Result |
|---|---|
| Relationships for a member with no couple and no friends keeps both cards and both invites | pass — `/person/user-1` |
| Couple card: rose wash, cloud band, framed owner, winged heart between the members | pass, after the contrast fix below |
| A member with a couple shows the peer's photo and the level/duration line under the heart | pass — `Lv.15 · 216 days` under the heart |
| Friend cards show the peer's photo inside the ring, with the level badge intact | pass — `Noah Friend Lv.24 · 126 days`, `Kenji Friend Lv.27 · 132 days` |
| Profile cover is real photography with bare white controls and the album strip legible | pass |
| Moments feed: author photos, portrait media inset | pass |
| Home and Messages rows show portraits; the inbox name matches the peer's photo | pass — `عبدالله` male, `نورة` female, and `Milo` is the same peer the couple card shows |
| Rooms screen: real covers on the list and grid cards | list pass; the grid toggle was not reached, it needs a tap |
| Me tab shows the member's own photo | pass |
| Crest medal renders with the member's honor glyph in the enamel | pass — `ليان` |
| Light scheme end to end | pass |
| Dark scheme end to end | pass |

### Defect found and fixed in the pass

- **The couple card's cloud band washed out its own labels.** The cloud art is near-opaque
  white, so anchored to the card's foot it erased the white names, and in the dark scheme it
  turned the card white and made `tints.couple.dark` pointless. The band now occupies the
  upper 72% at 0.6 opacity (0.22 in dark) and stretches, so the art's own fades meet the
  card's edges, and a rose floor gradient gives the names a surface to sit on in both
  schemes.

### Platform chrome left alone

- **The system navigation bar stays light in the dark scheme** — a pale strip under the tab
  bar, with the gesture pill. The app is not edge-to-edge, so on Android 14 that area is
  system chrome with its own background, and `expo-navigation-bar` is not installed. Fixing
  it needs a native config change and a rebuild, so it belongs to a platform pass rather than
  to this one.

### NOT verified in P4.2

- **Literal taps and swipes** — unchanged: `INJECT_EVENTS` is denied, so controls are
  verified as rendered, labelled and wired, not as pressed. The Rooms grid toggle and the
  honor wall are the two screens that this put out of reach.
- **Every fixture member's photo** — the pass covers the members screens select, not all 24
  portraits.
- **The `media:fetch` script against a clean checkout** — it was run against the working
  tree, where most files already existed, so the skip path is exercised but a full cold
  fetch is not.
- **iOS.** Cannot be built on Windows.

