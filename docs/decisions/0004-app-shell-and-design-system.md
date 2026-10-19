# 0004 — App shell + design system (P3)

**Date:** 2026-10-18
**Status:** DONE — implemented, all repo checks passing, and rendered on a physical device
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

## Primitives

`src/components/ui/`: `icon`, `app-screen`, `screen-header`, `divider`,
`app-button`, `icon-button`, `avatar`, `media-thumb`, `badge`, `tag-chip`,
`segmented-tabs`, `filter-chips`, `menu-row`, `states` (loading / empty / error /
locked), `bottom-sheet`, `confirm-dialog`, `action-menu`, `toast`.

Feature components: `app-bottom-tabs`, `people-row`, `room-card`,
`conversation-row`, `moment-card`, `promo-banner`, `user-badges`.

Hooks: `useAsync`, `usePaginated`, `useReducedMotion`, `useTheme`.

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
- **Icons are neutral placeholders.** `src/components/ui/icon.tsx` uses SF Symbols
  on iOS with an emoji/text fallback elsewhere. A real icon set is a deliberate
  follow-up: the reference app's iconography is protected trade dress, so it must
  not be copied.
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
| `npx jest` | PASS — **63/63** across 7 suites |
| Repository seam contract (pagination, cursors, filters, banner interleaving, like reconciliation + idempotency, simulated failures) | PASS — `src/core/data/repository.test.ts` |
| Hook state machine (append, cursor exhaustion, failed page keeps items, error + retry, refresh in place, **superseded key ignored**) | PASS — `src/hooks/use-async.test.tsx` |
| Formatting helpers | PASS — `src/core/format/format.test.ts` |
| RTL detection | PASS — `src/core/i18n/i18n.test.ts` |
| Component behaviour + accessibility label + monogram fallback | PASS — `src/components/people-row.test.tsx` |
| Badge cluster omits a level it does not have | PASS — `src/components/user-badges.test.tsx` |

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
