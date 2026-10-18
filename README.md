# Letgo

An original React Native + Expo app for social discovery and live voice rooms
with gifting. It is inspired by a set of reference screenshots, but all
branding, copy, and assets are original — the references are used only as
layout/flow inspiration.

> **Status:** Phases 0–2 are complete. The voice stack is verified end to end on
> a physical Android device (connect, ICE/DTLS, and a live Opus microphone track).
> See [`docs/decisions/`](docs/decisions) for the decisions and their evidence.

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
spike screen. To avoid typing a ~350-character JWT on a phone keyboard, pass it
through the deep link instead (note the **triple slash**):

```powershell
adb shell am start -a android.intent.action.VIEW -d "letgo:///dev/rtc-spike?token=<jwt>"
```

Full runbook, device constraints, and verification evidence:
[`docs/decisions/0003`](docs/decisions/0003-android-toolchain-and-local-rtc.md).

## Project layout

```text
src/
  app/          # expo-router routes (file-based)
    dev/        #   dev-only harnesses (deleted before release)
  core/
    config/     # env parsing + validation
    rtc/        # vendor-agnostic VoiceRoomAdapter + LiveKit implementation
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

## Conventions

- Only `EXPO_PUBLIC_*` variables reach the bundle. **Never** put secrets or
  tokens in `.env`.
- Money, wallets, purchases, and entitlements must be server-authoritative.
- Feature code must never import a vendor RTC SDK directly — go through
  `src/core/rtc`.
- `android/` and `ios/` are generated (Expo Prebuild) and git-ignored; native
  configuration lives in `app.json`.
