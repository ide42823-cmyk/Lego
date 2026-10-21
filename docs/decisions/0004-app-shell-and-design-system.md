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

## P5 — Honour tab and avatar frames (2026-10-20)

**Scope:** the profile's Honour tab (`ProfileHonorTab` / `HonorWallCard`) and every avatar in
the app. No route, no data-method signature and no other screen's layout changed.

Two things drove this pass. The Honour tab is the one profile section that is *entirely*
decoration in the reference — three ornate metal walls with the trophies standing on a shelf —
and a flat panel of square tiles could not answer the layout questions it raises: does a row
of trophies balance, do three tones read as one set, does the plate survive the dark scheme.
The second is that the project owner drew avatar frames for this app, so avatars should wear
them.

### What changed

- **The honour plates are generated art, in three tones and two schemes.**
  `tools/build-art.mjs` gained `honorPanel()` (660×220: plate gradient, sheen, metal double
  border, four mirrored corner sprigs with pearls, and a glass shelf at 168/220 with a
  highlight and a shadow), `honorMedal()` (ring, ticks, enamel disc, gloss, four gems) and
  `honorGiftFrame()` (rounded plaque, hairline, bevel, floor vignette) in the gold / violet /
  ice tones of the reference's badges / titles / gifts walls, light and dark.
  `npm run art:build` emits both `assets/art/*.svg` and `assets/media/art/*.png`.
- **What carries text is drawn by the screen, never baked into the art.** The title plaque
  (with its pointed tail), the filled title ribbon, the empty crown slot and the count chip
  are views, driven by a new scheme-keyed `tints.honor` group. A baked-in label could neither
  translate nor mirror in RTL, and the count has to be a live number. The gradient pills are
  one `Svg` `Rect` in a `viewBox="0 0 1 1"` stretched under a real border, so the pill stays
  crisp at any label width.
- **The walls reproduce the structure, not the art.** A titled plate, one row of previews
  standing on a shelf, and a count that opens the collection. Badges are our glyphs inside our
  medallion with a caption printed under the shelf (our glyphs carry no text the way the
  reference's art does), titles are text ribbons beside empty crown slots, and gifts are framed
  glyph plaques with a grade chip and a rarity chip that overhangs the plaque's foot.
- **A frame is data.** `AvatarFrameKey` lives in `core/data/types.ts` beside the other
  meanings and is carried by `UserSummary`, `ConversationSummary`, `MomentPost`,
  `UserProfile`, `MeDashboard` and — as `peerFrame` — `RelationshipRecord`, so a member's frame
  can no more differ between two screens than their photo can. `core/media/images.ts` maps the
  keys to art and holds `AVATAR_FRAME_FIT`: the measured canvas ÷ hole ratio **and the offset
  of the hole's centre from the canvas centre** (the heart and the blossoms hang below the
  ring, so their opening is not centred). `Avatar` applies both, which is what puts the photo
  exactly inside the opening — centre to centre, edge to edge — at any size. The numbers come
  from a flood fill of each PNG's alpha channel: the hole's horizontal extremes give its centre
  and diameter, its first transparent row gives its top.
- **`Avatar` grew a `frame` prop** that bleeds the art *outside* the avatar's layout box, so a
  row's geometry never depends on whether its member owns a frame. `FramedAvatar` sizes its
  outer box by the frame's ratio plus that offset so nothing clips, and falls back to the
  app's ring when the member has none; the Me tab uses it, so the animated halo's 1.9× box is
  laid out rather than overflowing the identity row.
- **One animated frame, and only on the account's own avatar.** `halo` is animated WebP
  (61 frames, 60 ms, 320², 1.4 MB, alpha intact). The fixtures give it to `FIXTURE_ME` and
  never to a directory row, a post or a conversation — sixty frames of alpha in a scrolling
  list is work the device should not do for decoration. `repository.test.ts` pins that.

### Verified

- `tsc`, `eslint`, `prettier --check` clean; `jest` 10 suites / 104 tests, four of them new:
  a member's frame is the same in every surface, the peer frame reaches the relationship
  cards, and the animated frame is reserved for the account.
- **Rendered at phone width off-device.** RN-web through the running dev server, captured
  headless inside a fixed 393 pt column, in light and dark: the three walls fit the screen,
  the shelf carries the rows, the count chips sit inside the plate, the plaques straddle the
  top edge, and all five frames centre their holes on the photo at 56 pt and 92 pt.

### Defects found and fixed in the pass

- **The badge caption sat on the shelf.** The plate's shelf moved from 158 to 168 (of 220) so
  that a medallion and its caption both clear the metal, and a row's foot is now derived from
  the art's own ratio rather than a hand-tuned offset.
- **The crown slots' `maxWidth` stretched every wall past the screen.** A capped flex child
  still contributes that cap to its row's intrinsic width, and because the honour column's
  width is resolved from its content, the cap made all three plates wider than the viewport
  and pushed the count chips off-screen. The cap is gone; the crowns share what is left.
- **Glyphs disappeared under the art on web.** An absolutely positioned image paints above
  in-flow siblings in CSS regardless of document order, so a trophy's glyph is now wrapped in
  a `zIndex: 2` layer instead of relying on paint order.
- **The count chip clipped the plate's border** — it moved inside the metal, and the plate's
  top sheen weakened from 0.5 to 0.32 so the pale band no longer washes the plate out.

### NOT verified in P5

- **Nothing on the handset.** The device was not attached during this pass, so the on-device
  table above still ends at P4.2: the Honour tab, the avatar frames and the animated WebP have
  not been seen on Android. RN-web is not Android — the WebP animation through `expo-image` in
  particular is unproven, as are the frame bleed over a card edge and the light navigation bar.
- **Taps and swipes** — unchanged: `INJECT_EVENTS` is denied on the handset, so the wall's
  count chip and each trophy are verified as rendered, labelled and wired, not as pressed.
- **iOS.** Cannot be built on Windows.

## P6 - the Me dashboard (2026-10-20)

### What changed

- **The account screen is now the reference's card rhythm.** Identity strip, then the
  following/friends/followers row on the page, then four cards: Recharge (wallet + the two join
  tiles), General Tools (four shortcuts), Games (three covers) and the account menu (seven
  actions). The old screen had the same information in a different shape — a flat tools
  section, four games in a wrapping grid, and a "More" list.
- **The dashboard's content is data, not screen literals.** `MeDashboard` gained `tools`,
  `games` and `menu`, typed as `MeTool`, `MeGame` and `MeMenuEntry`. `MeGame.kind` and
  `MeMenuEntry.key` are meanings; the screen owns the glyph and tint mapping, so swapping the
  icon set never touches fixtures and a future server payload fills the same fields.
- **VIP and SVIP share one tile.** `core/memberships.ts` groups the dashboard's memberships
  into the reference's two tiles and derives the second line (`Join` / `Renew` / `Active`) from
  the statuses it was told — it never decides an entitlement. Five unit tests pin the grouping
  and the copy.
- **Games use our own covers.** The reference's tiles are third-party game art (a licensed
  strategy game, a car game, Ludo). Those are not ours to ship, so each cover is a gradient
  from `tints.me.game` with a Lucide glyph (sparkles, checklist, dice) — modern, original, and
  consistent with the icon language used everywhere else.
- **The interface kit grew.** `GradientFill` is the tile-sized sibling of `ScreenGradient`;
  `MenuRow` gained `chevron`, `iconColor` and `valueAttention`; `Icon` gained `family`,
  `headset` and `warning` (UsersRound, Headset, TriangleAlert); and `tints.me` carries the
  membership tile and the three game gradients for both schemes.
- **The wallet is still display-only.** Recharge, both join tiles, the tools, the games and the
  menu actions that need a server hand off with an "arrives with the backend phase" toast. Only
  Share Letgo performs a real action (the platform share sheet) and reports a clear message
  when the platform has none. Nothing on this screen changes a balance.

### Verified

- `tsc`, `eslint`, `prettier --check` clean; `jest` 11 suites / 109 tests (five new for
  `membershipTiles`).
- **Rendered off-device at 320, 360 and 393 pt**, light and dark: no element crosses the
  viewport edge and no label clips. The tier tiles wrap to full-width rows at 320 pt, which
  is why the labels survive that screen; at 360 and 393 they stay side by side.
- **Every control was pressed in the browser** and produced its expected outcome: Recharge,
  VIP/SVIP, Aristocracy, each tool, each game, each menu row, and Share Letgo (falls back to
  "Sharing is not available on this device" where the platform has no share sheet). Accessible
  names read as "Recharge. Balance 260 coins", "VIP/SVIP. Join", "Visitors, 15 new", "My Level.
  0" — values are part of the label, not separate announcements.
- **Zero console errors** on the route.

### Defect found and fixed in the pass

- **The tile glyphs were invisible.** `GradientFill` is absolutely positioned; in CSS an
  absolutely positioned sibling paints *above* in-flow content whatever the document order, so
  the crown, the shield and the three game glyphs sat under their own gradient. Each tile now
  wraps its contents in a positioned layer (`position: relative` on the row, an absolutely
  positioned centred layer for the cover), which is the same class of fix as P5's `zIndex: 2`
  trophy layer.

### NOT verified in P6

- **Nothing on the handset.** The device was not attached during this pass. The layout was
  checked in RN-web, which shares the React Native layout model but not Android's font
  metrics, its elevation shadows or the system navigation bar.
- **RTL.** The screen uses logical properties throughout (`start`/`end`, no `left`/`right`) and
  the app ships Arabic copy, but the Arabic layout of this screen has not been looked at.
- **iOS.** Cannot be built on Windows.

## P7 - search (2026-10-20)

### What changed

- **One search screen, three directories.** `search` is a pushed route with a centred title,
  a back control, a full-width People/Rooms/Families tab row and a `mode` route param. Home's
  magnifier opens it on People, Rooms' opens it on Rooms; switching tabs keeps the query and
  re-runs it against that directory. Families is a view of the room directory restricted to the
  family category — the app has no separate family entity yet — and the singular "family" is a
  strong search term for those rooms. This closes the dead end on the most prominent control of
  both tabs.
- **Search lives behind the data seam.** `DataSource` gained `searchPeople(query, request)`,
  `searchRooms(query, request)` and `getSearchSuggestions()`. Both search methods return
  `SearchPage<T>` — a `Page<T>` with a `total`, so the screen can print "12 people" while
  only the first page is loaded — and the fixture implementation ranks in `core/search.ts`.
- **Matching folds the spellings members actually type.** `normalizeSearchText` lowercases,
  strips punctuation, Latin accents, Arabic harakat and tatweel, and folds alef forms
  (alef with hamza/madda to bare alef), ta marbuta (to ha) and alef maqsura (to ya). Every query
  token must match somewhere, so "maya japan" cannot return Maya in Egypt. Ranking puts the
  name first, then country/host/tag/category terms, then status/description.
- **What a term searches is what the card shows.** Room category and badge labels moved to
  `core/room-labels.ts`, shared by the room card and the search field set, so typing a visible
  chip ("Families", "Official") finds that room. Country codes resolve through `countryName`,
  so "Saudi" works without exposing or inventing a location.
- **The landing state is useful without a query.** Recent searches (session-scoped, capped at
  six, removable one by one or all at once) plus popular places/topics derived from the fixtures
  — every suggestion is guaranteed to return results, and a test pins that. Both the recent list
  and the suggestions are pure props; the store is `core/search-recents.ts` and the hook is
  `useSyncExternalStore`, so leaving and reopening search keeps the terms.
- **Search history is honestly temporary.** The real list belongs to the account and must be
  erasable from settings; until the backend exists it is kept in memory for the session. The
  screen says "Recent searches", never "synced".
- **Typing is debounced, clearing is immediate.** `useDebouncedValue` trails the query by
  250 ms; an empty field leaves results at once rather than waiting for the debounce. Each
  result page is keyed by mode + query, so a stale response can never replace a newer query.
- **All four request states are rendered.** Skeleton while the first page loads, `ErrorState`
  with retry, an empty state that offers the same query in another tab (People → Rooms,
  Rooms → People, Families → all rooms), and the list itself with pagination on scroll. The
  count line is a polite live region for screen readers.
- **The field owns its focus state.** The pill's border turns brand on focus, and a scoped
  `[role='search'] input:focus` rule removes Chrome's square focus ring inside the rounded
  field on web. The filled Search button submits the term (records it in the session's recent
  list) and is disabled, with a secondary-grey treatment, while the field is empty. Every
  control is a 44-point target; the field is labelled "Search people" / "Search rooms" /
  "Search family rooms", and the clear control says "Clear search".
- **Entry points.** Home's search icon and Rooms' search icon both navigate now; Rooms' room
  press toast also names the room instead of printing its id.

### Verified

- `tsc`, `eslint`, `prettier --check` clean; `jest` 14 suites / 150 tests (two more than the
  original P7 count: the Families-category contract and the singular "family" alias).
- **Rendered off-device at 320, 360 and 393 pt** with headless Chrome device metrics (DPR 2;
  light and dark): no horizontal overflow at any width, including the Arabic family-room
  results. Measured in the reference-aligned layout: at 320 pt the field is 185.3 pt wide at
  x=16 and the Search button 94.8 pt at x=209.3 (ends 304.1); at 393 pt the field is 258.3 pt
  and the button 94.8 pt (ends 377.1). Light and dark renders were reviewed at 393 pt.
- **P7's paths were exercised in the browser before this shell change:** Home → search
  (People), Cancel → Home, Rooms → search (Rooms), suggestion tap ("Music" → 2 rooms), a room
  press shows "The room screen for “Late Night Radio” arrives later", an empty query
  ("zzzz" → "No rooms found") switches to People and re-runs the same query, Arabic "موسيقى"
  → 6 rooms, "maya" → 1 person, opening the result lands on `/person/user-1`, and the greeting
  confirmation reads "Greeted Maya K." (the name's own full stop is no longer doubled). Recent
  searches survived leaving and reopening the screen; clearing the field returned to the
  landing state. **The reference-aligned shell was then exercised for** People/Rooms/Families,
  live typing, the disabled and enabled Search button, the empty state, both schemes and the
  sizes above. The back control calls the same handler the removed Cancel button used.
- **RTL.** With `dir="rtl"` on the document, the back control moves to the right, the tab order
  reverses, and the field and Search button swap sides (button 16–110.8, field 118.8–377.1 at
  393 pt) with no overflow. The copy in that check is still English, so the full Arabic layout
  remains unverified.
- **Zero console errors or warnings** on the route after the focus-ring fix.

### Defects found and fixed in the pass

- **Double full stop in the greeting toast.** Fixture names already end in a full stop
  ("Maya K."), so `Greeted ${name}.` read "Greeted Maya K.." on every surface. `useGreet`
  now drops trailing punctuation before appending its own.
- **Chrome's focus ring inside the rounded field.** The browser draws a square outline around
  the inner `<input>`, so a focused search field showed two misaligned borders. The pill's
  brand border is now the focus indicator, and the global rule suppresses only the inner ring.

### P7.1 — reference alignment (2026-10-20)

The project owner supplied the reference's search, filter and ranking screens after P7. This
pass brings Search to that structure; Filter and Ranking are separate passes.

- **Header and tabs.** The pushed screen now has a back chevron, a centred "Search" title, and
  three equal-width tabs (People / Rooms / Families) whose selected state is a full-width black
  bar sitting on a hairline — the reference's shape. The tabs are a local `SearchTabs`
  component rather than a new `SegmentedTabs` variant, so the directory tabs on Home and Rooms
  are unchanged.
- **Search row.** The pill is flat grey with a magnifier and clear control; a filled brand
  "Search" button sits to its right, as in the reference. Results still update live (250 ms
  debounce); the button commits the term to the session's recent list. While the field is
  empty the button is disabled and uses the secondary surface rather than a washed-out purple,
  which keeps it legible in both schemes.
- **Content surface.** The area under the row uses `surfaceMuted`, so result cards and chips
  read as raised white cards on the reference's light grey (the dark scheme uses its existing
  elevated-surface relationship). Empty and error states are vertically centred in that area.
- **Families.** The third tab is the room directory filtered to the `families` category, not an
  invented family entity. The landing shows family-room names (the most useful chips for a room
  directory), and the singular "family" is a strong term alongside the plural category label.
  The empty state offers "Search all rooms".
- **Deliberate deviations.** The reference's content area is a location-permission gate
  ("Turn on location…"). The app has no location feature yet, so reproducing an "Enable Now"
  button would be a dead control; the landing keeps the real recents/suggestions instead. Copy
  and labels use the app's vocabulary (People/Rooms/Families, not the reference's
  Users/Chat room/Family), and the reference's original-app name does not appear anywhere.

### NOT verified in P7

- **Nothing on the handset.** The device was not attached during this pass. Layout was checked
  in RN-web; Android font metrics, keyboard resize behaviour and the IME's Arabic composition
  are unproven.
- **Keyboard navigation on web.** The focus border is visible, but a full Tab/Shift-Tab and
  screen-reader pass has not been done.
- **RTL.** The English screen was mirrored with `dir="rtl"` and the field/button/back/tab
  geometry checked; the app's Arabic copy and native `I18nManager` layout have not been.
- **The reference's location gate and family entity.** The app has no location permission
  flow, so the reference's "Turn on location" empty state is deliberately not reproduced; the
  landing shows real recents and suggestions instead. Families is a filtered room directory,
  not a separate family object or family leaderboard.
- **iOS.** Cannot be built on Windows.
- **History persistence and server search.** Recents die with the session; real search history,
  trending terms, ranking and result totals belong to the backend phase.

## P8 - people filter sheet (2026-10-21)

### What changed

- **The Home filter button is real.** It opens a bottom sheet modelled on the reference: a
  centred "Filter" title, a close control, gender pills, dual-handle Age and Distance sliders,
  an Online-users-only switch, the gold VIP Privileges (Language) and Aristocracy Privileges
  (Country) sections, and a fixed Reset/Confirm footer. The scrim dims the Home directory
  behind it. Closing the sheet or the scrim discards the draft; Reset returns the draft to
  neutral; only Confirm commits.
- **Filters live behind the data seam.** `PeopleFilterOptions` (real age bounds, a distance
  bound that covers every bucket, unique sorted countries and languages) and `PeopleFilters`
  are types in `core/data/types`; `DataSource.getPeopleFilterOptions()` supplies the facets and
  `listPeople(mode, request, filters?)` applies them before promotion banners and pagination.
  `core/people-filters.ts` owns the meaning of "everyone": a full-range slider is neutral, and
  a narrowed range excludes members who have not shared that field rather than treating
  unknown as a match. `countActivePeopleFilters` drives the brand dot and the accessible
  "Filter people, 4 active" label.
- **Language became a real directory field.** `UserSummary.language` is generated on its own
  RNG stream, so no existing fixture value, screenshot or test moved. Country uses the existing
  coarse locale, distance the existing buckets, and age the fixture ages (18-39); the distance
  bound rounds up to 1000 km. Languages and countries are derived from the fixtures and sorted
  by their visible labels.
- **The sheet edits a draft.** It is seeded from the committed filter each time it opens and
  never touches the list while a handle is dragged. Confirm commits a stable filter object,
  which becomes part of the list request key and resets the list; the Home empty state now says
  "No one matches" and offers "Clear filters". The filter icon gains a brand dot and an
  accessible active count when anything is narrowed.
- **A local dual-handle slider avoids a native dependency.** `components/ui/range-slider.tsx`
  draws the track and two 22 pt thumbs inside 44 pt targets, uses the responder system to pick
  and move the nearer handle, and `core/range.ts` to round to steps and prevent the handles
  from crossing. Each handle is `adjustable`, has increment/decrement actions for native screen
  readers, and sets `aria-valuemin`/`max`/`now`/`text` for the web. The numeric axis stays
  left-to-right in RTL; only the labels and surrounding layout mirror.
- **BottomSheet gained a fixed footer and a centred-title option.** `titleAlign` adds a
  symmetric 44 pt spacer, `footer` sits below the scrolling body above the safe-area inset, and
  the scroll body can shrink. The sheet title is now 17 pt bold for every sheet.
- **VIP/Aristocracy headings are presentation, not entitlement.** The gold headings match the
  reference. Language and Country are ordinary fixture facets in this front-end pass; the sheet
  does not read memberships, grant a privilege, or claim a successful purchase. Entitlement and
  filter enforcement remain server work, and the ADR will gain that section when memberships
  are wired.

### Verified

- `tsc`, `eslint`, `prettier --check` clean; `jest` 16 suites / 178 tests (28 new: 11 filter
  helpers, 9 range helpers, 8 repository contract cases).
- **Rendered off-device at 393 (light and dark) and 320 pt** with headless Chrome device
  metrics (DPR 2): no horizontal overflow; both slider thumbs sit fully inside the track; at
  320 the sheet body scrolls (scrollHeight 548, clientHeight 475) while the footer stays fixed,
  and the Country row is reachable. Zero console errors or warnings.
- **Interactions:** dragging the Age minimum to 25 produced "25-39"; Female + online + Age
  25-39 + Arabic produced 3 members, all female, online, Arabic and within the range; the
  filter button then read "Filter people, 4 active"; dragging Distance to 0 produced
  "0-0 km" and Confirm produced "No one matches" with a Clear filters action.
- **ARIA values on the web handles** are now non-null `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow` and `aria-valuetext`; Reset returns the draft to default and Confirm commits
  it.
- **RTL.** With `dir="rtl"`, the close control moves left, the section headers right-align, the
  footer order reverses and the picker chevrons move to the leading edge, with no overflow.
  The slider's numeric axis intentionally stays LTR.
- **Keyboard:** the filter sheet's controls are reachable by the web tab order through their
  button/radio/switch roles; the custom slider's arrow-key handling is not implemented (see
  below).

### NOT verified in P8

- **Nothing on the handset.** The device was not attached; native slider gestures, Android
  switch rendering and the modal's keyboard resize are unproven.
- **Slider keyboard and screen-reader pass.** The handles expose values and native actions, but
  a full TalkBack/VoiceOver and arrow-key pass has not been done.
- **Full Arabic copy and native RTL.** The English sheet was mirrored with `dir="rtl"`; the
  app's Arabic copy and `I18nManager` layout have not been reviewed.
- **Entitlement enforcement.** No membership gate is applied to Language or Country; that
  belongs to the server phase and is deliberately not simulated.
- **Rooms filtering.** This pass filters the people directory only, which is the directory the
  reference's filter belongs to. Rooms' filter control remains a later pass.

## P9 - Regional Rank (2026-10-21)

The reference for this pass is the ranking screen (`17.33.06`): a dark purple "cosmic stage"
titled **Regional Rank**, a flat text category rail, individual Daily/Weekly/Monthly pills and a
region control, a second-first-third podium under arch columns, large divider-less rows, a
floating **Previous** pill, a sticky self-row and pink heart score marks. The first attempt at
P9 read the file names rather than the pixels and built a light lavender screen; that write-up
was wrong and is replaced by this one. The screen was then rebuilt against the image.

### What changed

- **The trophy is now a real destination.** Home's header trophy pushes `/ranking`; the Rooms
  trophy deep-links to `/ranking?category=room`. Ranking is a pushed route with
  `headerShown: false` and draws its own stage header, so it does not disturb the five-tab
  shell.
- **The stage is deliberately dark in both schemes.** `RankingPalette` (like `RoomPalette` and
  `PremiumPalette`) is a fixed night-sky palette, so a light-scheme device still gets the
  reference's purple sky, white text and gold gift. `RankingBackground` draws the original
  composition - an SVG sky gradient, a radial glow behind the podium and a scatter of static
  stars - with no animation, so it needs no reduced-motion branch. A light `StatusBar` sits over
  it. The region sheet and toasts stay on the normal app theme.
- **Controls match the reference, not a segmented track.** `CategoryTabs` is a horizontal
  tablist of plain text labels (Charm, Wealth, Newcomer, Room, Games, Family); the selected one
  turns white and bold and the strip scrolls the selection into view, including on a deep link.
  `PeriodTabs` renders Daily/Weekly/Monthly as individual translucent pills (the selected pill
  is brand purple). `RegionButton` sits at the trailing edge with the active region or "All".
  Every control is a 44 pt `accessibilityRole="tab"` / `"button"` with an explicit
  `aria-selected` (React Native Web ignores `accessibilityState`).
- **The region filter is real, and lives in the data layer.** `Leaderboard` now carries
  `regions: FilterOption[]` and the active `region`; `DataSource.listLeaderboard(category,
  period, region?)` filters entries by `locale` (members) or room country and **renumbers the
  surviving rows**, so a filtered board never shows a rank gap. `regions` is derived from the
  unfiltered board and sorted by label, so the sheet can never offer a place with no standings.
  Region persists across category and period changes. The row, podium and self-bar rendering
  never sort or re-rank; that is the source's job.
- **Podium and rows are an original composition.** `LeaderboardPodium` is a 2-1-3 arrangement
  with original arch columns, a stage floor, a gold crown on the winner, per-rank medal rings
  and medallions, the VIP/host line and a heart score. `LeaderboardRow` is an airy 76 pt row -
  rank, 56 pt avatar, name, tier or host, heart and value - with no card and no separators. The
  reference's engraved columns and ornate metal frames are trade dress and are **not**
  reproduced; portraits reuse the app's own frame art.
- **The self bar is honest.** `RankingSelfBar` is pinned above the safe-area inset and shows
  "You", the account's presentation-only active VIP badge from `FIXTURE_ME.memberships`, and
  **"Not ranked yet"**. There is no viewer position or score on the wire, so none is invented;
  the accessible label says the rank arrives with the backend phase.
- **The heart is a score mark, not a currency.** Every board uses the filled pink heart for its
  value column; the accessible metric still comes from each category's own label, so a room is
  not announced as charisma.
- **Fixture scores, no client arithmetic.** The data layer builds a deterministic board per
  category/period/region from the existing member profiles and room summaries. Names,
  portraits, frames, levels, VIP ranks, countries, hosts and covers are the same fixture
  objects the rest of the app uses. Scores are explicit fixture aggregates because real
  period standings are server work; the view never presents them as server data and does no
  wallet, purchase or entitlement arithmetic.
- **Out-of-scope controls state the phase.** The gift raises "Gifting arrives with the backend
  phase.", Previous raises "Previous rankings arrive with the backend phase.", and a room row or
  podium spot raises "The room screen for ... arrives with the backend phase." A member row or
  podium spot opens that person's real `/person/[id]` profile. No dead control was added.
- **Games and Family are honest unavailable states.** There is no game score table and no family
  entity in this build, so both render a centred icon, "No ... rankings yet" and the
  backend-phase copy - never a fake table or zeroed list. `states.tsx`-style loading, error and
  empty views are provided stage-side: a static arch-and-row skeleton (no shimmer), a retry, and
  an empty state with a "Show all regions" action.

### Verified

- `prettier --write`, `tsc --noEmit`, `expo lint` clean; `jest` **17 suites / 195 tests**,
  including the leaderboard vocabulary/`splitPodium` suite and the data-source board and region
  contract cases.
- **Live web (Metro) capture, 393x852:** light and dark both render the stage; `scrollWidth ===
  clientWidth` (no horizontal overflow) and zero console errors. Category rail now fits all six
  labels at 393 pt (Family right edge 355).
- **320x568:** `body.scrollWidth` stays 320; the selected tab and the region button stay inside
  the row; the list scrolls under the fixed controls with the bottom inset reserved.
- **Region sheet:** opens from "All"; a real board filters to the chosen country and the podium
  renumbers (Germany charm: ranks 1/2/3 only).
- **Empty region:** `/ranking?category=charm&region=FR` renders "No standings in FR / No one
  from FR has ranked on the daily charm board yet." with a "Show all regions" action, which
  returns the full board.
- **Unavailable boards:** Games and Family render their icon, title and backend-phase copy with
  no rows, and the region control is hidden when the board has no regions.
- **Room board:** `/ranking?category=room` shows room covers, host lines and hearts; the room
  row raised "The room screen for "Late Night Radio" arrives with the backend phase."
- **Loading:** the first paint before the 450 ms simulated latency shows the arch/row skeleton
  with the tabs still usable.
- **Toasts:** gift and Previous each raised their backend-phase notice.
- **RTL:** setting `dir="rtl"` on the DOM mirrors the whole screen - the back control jumps from
  x 8 to x 341, the category and period rails reverse, the podium reads 3-1-2, rows put the rank
  on the right and the value on the left, and Previous and the self bar swap sides - with no
  overflow. (The app uses logical flex order and `marginStart`, so this is CSS direction rather
  than `I18nManager`.)
- **Accessibility attributes:** both rails expose `aria-selected` true/false; every row and
  podium spot is a button whose label starts "Rank N" and includes the value and metric.

### Device pass (2026-10-21)

A Xiaomi `24117RN76G` (HyperOS, Android 14, 1080x2400 ≈ 384x853 dp) was attached and the debug
build loaded from Metro over `adb reverse`.

- **Deep-linked screens:** charm daily and room daily in light and dark; weekly; Games and
  Family; the `FR` empty region. The stage fills the width at 384 dp, all six category labels
  fit without scrolling, portraits and avatar frames render, and the self bar sits above the
  gesture area. Home, Rooms, Search, Me and a member profile were also captured (P5-P8 render
  evidence).
- **Safe areas:** the status-bar icons are light over the stage; the category rail, podium and
  list are inset correctly; the sticky self bar clears the gesture bar. No clipped text or
  horizontal overflow was visible.
- **One Android-only artefact:** in light scheme, the system navigation-bar strip under the
  sticky self bar follows the OS theme (white), so a light strip appears below the dark stage.
  Matching it needs `expo-navigation-bar`/edge-to-edge configuration, which is not in this
  dependency set; the reference is iOS and has no such strip.

**Interactive controls were not exercised on this handset yet.** MIUI denies the shell
`INJECT_EVENTS` and `WRITE_SECURE_SETTINGS` permissions ("USB debugging (Security settings)"
is off), so taps and the native RTL flag cannot be injected from the host. The region sheet,
tab/period taps, gift/Previous/room toasts, the P8 filter sheet and the P5 Honour tab still
need a human tap; their logic is covered by the web pass and tests.

### NOT verified in P9

- **Touch and TalkBack.** No tap could be injected on the handset, so rail taps, FlatList
  momentum, the region sheet, the toasts, the filter sheet and the Honour tab are unproven
  natively; TalkBack/VoiceOver reading order is also unproven. Safe-area layout was verified by
  screenshot.
- **Real standings.** Every number is fixture data. Server-computed period aggregates,
  tie-breaking, anti-abuse and the member's own rank/country are backend work; the self bar
  therefore reads "Not ranked yet".
- **Region empty state via the picker.** `regions` is derived from the unfiltered board, so the
  picker only lists places that have standings; the empty state was exercised through a deep
  link to a region the board does not contain.
- **Error state visually.** The screen uses the keyed `useAsync` error path with a retry, but no
  failure was induced, so it was not captured.
- **Full Arabic copy and native RTL.** The English screen was mirrored with DOM `dir="rtl"`;
  Arabic labels and native `I18nManager` layout have not been reviewed. React Native Web
  hardcodes `isRTL: false`, and MIUI blocks writing `debug.force_rtl` from the host, so the
  native back-chevron flip and mirrored flex order are unproven.
- **Reference art and copy.** The stage, arches, medals and copy are our own; the reference's
  original art, logos and wording are not reproduced.
- **Games and Family product features.** Those boards need a score service and a family entity;
  this pass deliberately shows only their honest unavailable state.

## P10 — Home fidelity pass (2026-10-21)

A second pass over Home after P9, against the three Home references. It changes the P3
directory's anatomy and the five-tab bar; routes, the data seam and the server-authority rules
are unchanged.

### What changed

- **Header.** The four views keep their order (Recommend, Nearby, New users, Featured) and the
  reference's gradient plate, but the mode labels are 16 pt with a 14 pt gap, a 24 pt trailing
  pad and a per-item `onLayout` auto-scroll that pulls the selected label clear of the search /
  filter / trophy cluster. The filter is only present on Nearby and New users, or when a filter
  is active; on Recommend and Featured it is absent, matching the reference. At widths below
  390 pt the three action boxes shrink from 44 to 40 pt; an 8 pt `hitSlop` keeps every target
  above the 44 pt requirement. The `Recommend` row leaves only a sub-pixel sliver of `Featured`
  at 384/393 pt; the row scrolls, and the auto-scroll reveals later labels after selection.
- **Rows.** The card is 60 pt avatar, a 76 pt gradient Hi pill, a 2-line name budget, 16 pt
  verified / flower marks, the age pill (the gender mark now lives only there), VIP/SVIP/AR
  pills, the distance/bio line and the online dot. Directory rows use the quiet `verified` seal
  plus the pink level flower, at most two badges, and no `NEW` chip. The card heights vary only
  because the decorative names wrap; there is no horizontal overflow at 320, 384 or 393 pt.
- **Names.** The data layer accepts arbitrary Unicode, including `꧁…꧂`, `༒` and Arabic
  ornamentation. The fixture display names use inline ornaments (`♛ ♡ ☾ 『』 ୨୧`, emoji) rather
  than tall Javanese / Tibetan frames: the web fallback font puts those frames on their own line
  box and consumes the two-line name budget. Search tests assert the stable substrings
  (`Maya`, `نورة`, `لمى`), not the decoration.
- **Promotions.** Banners now follow every fourth member instead of every fifth, so the first
  promo sits after the fourth card as in the references. The plates and copy are original
  gradients; no reference art, logo, trade dress or the reference's name is reproduced.
- **Bottom bar.** The five marks stay near-black in both schemes (the active tab is signalled by
  the lavender circle and the heavier label, not by greying the other four). Glyphs are 26 pt,
  labels 12.5 pt. The cloud home keeps an outlined heart, the room mark keeps its three bars, and
  Messages is now a rounded speech bubble with a drawn smile rather than a plain circle. The
  active Home circle, unread badge and Me dot are unchanged.
- **No wallet arithmetic.** The pass adds no coin, purchase, entitlement, delivery or rank math.
  Hi remains the existing local greeting; promos and badges are presentation-only fixtures.

### Verified

- `prettier --write`, `tsc --noEmit`, `expo lint` clean; `jest` **17 suites / 195 tests**.
- **Web (Metro), 384x853 and 393x852, light and dark:** all four header views; the first promo
  after four members; the four-card stack plus promo at the top; the full-name cards (`Sky
  Lord`, `أميرة الظلام`, `Night King`, `Dragon Lord`, `Purple Soul`); the filter absent on
  Recommend and Featured and present on Nearby and New users; the full `Nearby New users
  Featured` header at 384 with the compact action boxes; `body.scrollWidth === innerWidth`
  (no horizontal overflow) and zero console errors.
- **320x568:** no horizontal overflow; the mode row scrolls and the later labels are a scroll
  affordance; the `SVIP` pill can wrap below the age pill and long names can truncate. This is
  treated as a stress width, not a target layout.
- **RTL (DOM `dir="rtl"`):** the shell, cards, banner and bottom bar mirror (avatar right, Hi
  left, CTA left, icon right, Home tab right); no horizontal overflow. The header's
  `marginEnd` / `paddingEnd` stay physical on React Native Web because RNW hardcodes
  `isRTL: false`, so the tab scroller leaves a clipped previous label and the auto-scroll is not
  RTL-aware. The code uses logical properties; the native `I18nManager` path and a native Arabic
  layout still need the device pass below.
- **Not a device pass.** `adb devices` was empty for this pass; the Xiaomi handset used for P9
  was not attached. Its earlier P5-P9 screenshots still cover the shell and safe areas, but the
  new card anatomy, outlined cloud heart, Messages smile and compact header actions have only
  web render evidence. Interactive taps (mode tabs, filter sheet, Hi toast, promo, search) and
  native RTL remain open.

### NOT verified in P10

- **Native render of the new Home.** No handset was attached, so decorative Unicode rendering,
  the 26 pt custom glyphs, safe-area insets around the taller bottom bar and Android font
  fallbacks (Mathematical Script, Arabic, emoji) were not re-shot on the device.
- **Native RTL.** React Native Web hardcodes `isRTL: false`; the DOM-dir capture cannot prove the
  `I18nManager` margin resolution, the header scroller direction or the Hi/VIP internal order.
  Full Arabic copy is also out of scope for this pass.
- **Interactive states.** The mode tabs, filter sheet, Hi toast, promo actions and TalkBack
  reading order are covered by the web pass and tests, not by injected device taps (MIUI blocks
  `INJECT_EVENTS`).
- **Promo and badge entitlement.** The banners, gradients and level marks are fixture
  presentation. Real campaigns, VIP/Aristocracy entitlement and purchase delivery are backend
  work; no success or entitlement is simulated on the client.
- **Error state visually.** The keyed loading/error/empty branches are unchanged and were not
  re-induced in this pass.
