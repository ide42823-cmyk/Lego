# Letgo

An original React Native + Expo app for social discovery and live voice rooms
with gifting. It is inspired by a set of reference screenshots, but all
branding, copy, and assets are original — the references are used only as
layout/flow inspiration.

> **Status:** Phases 0—3 are complete, and the front end is now being built out one
> page at a time. The voice stack is verified end to end on
> a physical Android device (connect, ICE/DTLS, a live Opus microphone track, and
> a 20-minute lossless downlink), and the app shell — five-tab navigation, design
> tokens, data seam, and UI primitives — is implemented, passing all repo checks,
> and verified rendering on a physical device. A follow-up pass then reworked
> every screen for reference fidelity and moved the icon set to Lucide on real
> SVG. The first page of the next pass - the public member profile
> (`person/[id]`), reached from people rows, contacts and post authors - is in,
> and a fidelity pass then brought its cover, identity chips, crest and section
> bodies in line with the reference in both the light and dark schemes. The
> Relationships tab now keeps its cards with no records (the invitations *are*
> the empty state), and the app renders real placeholder photography and its own
> generated decoration instead of colour blocks — checked on the handset in both
> schemes — see
> [`assets/media/README.md`](assets/media/README.md) for what to replace. The
> profile’s Honour tab is in as well: three generated plates (gold badges,
> violet titles, ice gifts) with the trophies standing on their shelves, the title
> plaque and the count chip drawn by the app so they translate and mirror in RTL,
> and members wearing the avatar frames the project owner drew — four stills
> and one animated, reserved for the account’s own avatar. That pass is
> checked by render, not yet on the handset. The Me tab has since been rebuilt to
> the reference’s card rhythm — wallet and membership tiles, tools, games and the
> account menu, all fed from the dashboard fixture with our own art in place of
> the reference’s third-party game covers. Search is now a real screen as
> well: one field with People, Rooms and Families tabs, ranked matching over the fixture
> directories (Arabic spelling variants included), session-scoped recent searches,
> popular terms derived from the data, and loading, error, empty and no-result
> states. The people directory now has a working filter sheet — gender, age and
> distance ranges, online-only, language and country — with a draft/confirm flow,
> a hand-built accessible dual slider, and an empty state that offers to clear
> the filters — see
> [`docs/decisions/`](docs/decisions) for the decisions and their evidence,
> including what is **not** verified yet.

## Requirements

- **Node.js** 22+
- **Android:** JDK 17 + Android SDK (`platform-tools`, `android-36`,
  `build-tools;36.0.0`) — already installed and documented in
  [`0003-android-toolchain-and-local-rtc.md`](docs/decisions/0003-android-toolchain-and-local-rtc.md).
- **iOS:** a macOS machine.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in values as needed
npm start
```

The app is **not** compatible with Expo Go: the voice stack ships native code,
so use a development build (`npm run android` / `npm run ios`).

> **Windows:** build the native app through `tools/android-build.ps1` instead of
> `npm run android`. `react-native-reanimated`'s deep C++ tree overflows the
> classic 259-character path limit, and the Android SDK ships a `ninja` (1.10.2)
> old enough to ignore long-path support. The script verifies/replaces that
> `ninja` and builds a single ABI (see
> [`0003`](docs/decisions/0003-android-toolchain-and-local-rtc.md)).
>
> ```powershell
> powershell -ExecutionPolicy Bypass -File tools/android-build.ps1
> powershell -ExecutionPolicy Bypass -File tools/android-build.ps1 -Abi x86_64  # emulator
> ```

## Scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | Strict TypeScript, no emit |
| `npm run lint` | ESLint via `eslint-config-expo` |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:watch` | Jest + Testing Library |
| `npm run android` / `ios` | Build and launch a dev build |
| `npm run prebuild:android` | Regenerate the native `android/` project |
| `npm run rtc:token` | Mint a **dev-only** LiveKit token (see below) |

## Testing voice locally (no vendor account needed)

A self-hosted LiveKit server plus a dependency-free token minter make it
possible to test real audio without a cloud account:

```powershell
# 1. Start the local server
& "$env:LOCALAPPDATA\livekit\livekit-server.exe" --dev --bind 0.0.0.0

# 2. Mint a token per device
npm run rtc:token -- --room spike --identity phone-a --name "Phone A"
```

Then set `EXPO_PUBLIC_LIVEKIT_URL` (`ws://10.0.2.2:7880` for the Android
emulator, `ws://<your-LAN-IP>:7880` for a physical device) and open the dev
spike screen from the **Me** tab (developer section, debug builds only). To avoid
typing a ~350-character JWT on a phone keyboard, pass it through the deep link
instead (note the **triple slash**):

```powershell
adb shell am start -a android.intent.action.VIEW -d "letgo:///dev/rtc-spike?token=<jwt>"
```

Full runbook, device constraints, and verification evidence:
[`docs/decisions/0003`](docs/decisions/0003-android-toolchain-and-local-rtc.md).

## Project layout

```text
src/
  app/          # expo-router routes (file-based)
    (tabs)/     #   the five tab destinations (Home/Moments/Rooms/Messages/Me)
    dev/        #   dev-only harnesses (deleted before release)
  components/
    ui/         #   design-system primitives (buttons, sheets, states, ...)
  constants/    # design tokens (colour, spacing, radius, palettes)
  core/
    config/     # env parsing + validation
    data/       # domain types + the DataSource seam (fixtures today, API later)
    format/     # presentation formatting helpers
    i18n/       # text-direction helpers
    rtc/        # vendor-agnostic VoiceRoomAdapter + LiveKit implementation
  hooks/        # useAsync / usePaginated / useReducedMotion / useTheme
tools/          # dev scripts (not bundled)
docs/decisions/ # architecture decision records
```

## Documentation index

- [`README_AI_START_HERE.md`](README_AI_START_HERE.md) — context bundle for AI agents
- [`PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md`](PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md) — audit + phase plan
- [`sugo_inspired_app_architecture_and_flows.md`](sugo_inspired_app_architecture_and_flows.md) — product/architecture source of truth
- [`sugo_screen_by_screen_analysis.md`](sugo_screen_by_screen_analysis.md) — notes for all 100 reference screens
- [`docs/decisions/0001`](docs/decisions/0001-project-foundation.md) — SDK/tooling foundation
- [`docs/decisions/0002`](docs/decisions/0002-rtc-provider-spike.md) — RTC provider choice
- [`docs/decisions/0003`](docs/decisions/0003-android-toolchain-and-local-rtc.md) — Android toolchain + local RTC environment
- [`docs/decisions/0004`](docs/decisions/0004-app-shell-and-design-system.md) — app shell, design system, and data seam

## Conventions

- Only `EXPO_PUBLIC_*` variables reach the bundle. **Never** put secrets or
  tokens in `.env`.
- Money, wallets, purchases, and entitlements must be server-authoritative.
- Feature code must never import a vendor RTC SDK directly — go through
  `src/core/rtc`.
- `android/` and `ios/` are generated (Expo Prebuild) and git-ignored; native
  configuration lives in `app.json`.
