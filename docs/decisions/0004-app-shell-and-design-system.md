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
