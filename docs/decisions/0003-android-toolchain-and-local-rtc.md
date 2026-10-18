# 0003 — Android toolchain + local RTC test environment

**Date:** 2026-10-18
**Status:** DONE — APK built, installed and **voice RTC verified on a physical device**
**Phase:** P2 completion — option A ("install the SDK, make it work")

## Decision

Finish P2 on this Windows machine instead of deferring it:

1. **Install a local Android build toolchain** (JDK 17 + Android command-line
   tools) so a real debug APK can be produced and the native modules actually
   compile. Chosen over `eas build` because it is free, offline-friendly and
   verifiable here.
2. **Avoid depending on a LiveKit Cloud account** by running the self-hosted
   `livekit-server` in `--dev` mode and minting tokens with a tiny local script.
   This removes the "no account yet" blocker entirely.
3. **Test on the physical phone, not the emulator.** The emulator was abandoned
   (see below).

## What was installed

| Component | Version | Location |
|---|---|---|
| Eclipse Temurin JDK | 17.0.20.1+1 | `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot` |
| Android `cmdline-tools` | build `13114758` | `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest` |
| `platform-tools` (adb) | 1.0.41 | `%LOCALAPPDATA%\Android\Sdk\platform-tools` |
| Android platform | `android-36` (AGP also pulled `android-37`) | `%LOCALAPPDATA%\Android\Sdk\platforms` |
| Android build-tools | `36.0.0` (AGP also pulled `37.0.0`) | `%LOCALAPPDATA%\Android\Sdk\build-tools` |
| Android NDK | `27.1.12297006` | `%LOCALAPPDATA%\Android\Sdk\ndk` |
| LiveKit server | `1.13.10` (windows amd64) | `%LOCALAPPDATA%\livekit\livekit-server.exe` |
| LiveKit CLI (`lk`) | `2.19.0` | `%LOCALAPPDATA%\livekit\lk.exe` |

Persisted to the **User** environment (so future shells/editors find them):
`JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `PATH` additions for
`java\bin`, `platform-tools`, `cmdline-tools\latest\bin`, `emulator`.

The native project resolves to `compileSdk 37`, `targetSdk 36`, `minSdk 24`,
`buildTools 37.0.0`, `ndk 27.1.12297006`, `kotlin 2.2.10`.

## How the local RTC stack works

```powershell
# 1. Start the server (dev mode: API key "devkey", secret "secret")
& "$env:LOCALAPPDATA\livekit\livekit-server.exe" --dev --bind 0.0.0.0

# 2. Mint a short-lived participant token
npm run rtc:token -- --room spike --identity phone-a --name "Phone A"

# 3. A second participant to exercise the subscribe path
& "$env:LOCALAPPDATA\livekit\lk.exe" room join --url ws://127.0.0.1:7880 `
    --api-key devkey --api-secret secret --identity bot-b --publish-demo spike
```

- Ports: **7880** signal/WebSocket, **7881** TCP fallback, **7882/udp** media.
- `--bind 0.0.0.0` is required; the default binds loopback only and the phone
  cannot reach it.
- `tools/livekit-token.mjs` is **dependency-free** (Node `crypto` only) and is a
  dev tool: it is not bundled into the app and must never sign production keys.
- The app reads only `EXPO_PUBLIC_LIVEKIT_URL` (see `.env.example`) to prefill the
  dev spike screen. **Tokens are never read from env** — they stay short-lived.
- The host firewall needed **no** inbound rule; Windows Firewall was simply not
  configured for `livekit-server` and the phone reached `192.168.3.16:7880`
  regardless.

### Which URL to use

| Target | `EXPO_PUBLIC_LIVEKIT_URL` |
|---|---|
| Android emulator | `ws://10.0.2.2:7880` |
| Physical device (same Wi-Fi) | `ws://192.168.3.16:7880` |
| LiveKit Cloud | `wss://<project>.livekit.cloud` |

### Driving the device without typing a JWT

Typing a ~350-character JWT on a phone keyboard is impractical, and MIUI blocks
`adb shell input text` (see "MIUI gates ADB work" below). The dev spike screen
therefore also accepts `url`/`token` as **deep-link query parameters**:

```powershell
$t = (node tools/livekit-token.mjs --identity phone-a --room spike).Trim()
adb shell am start -a android.intent.action.VIEW -d "letgo:///dev/rtc-spike?token=$t"
```

Note the **triple slash**: `letgo://dev/rtc-spike` parses `dev` as the URI *host*,
leaving the path `/rtc-spike`, which matches no route.

## Windows MAX_PATH — build blocker and fix

The first `gradlew assembleDebug` failed after ~40 minutes:

```text
ninja: error: mkdir(CMakeFiles/reanimated.dir/C_/Users/.../CSS/interpolation/transforms/operations): No such file or directory
BUILD FAILED in 39m 36s
```

This is the **Windows classic path limit (259 chars)** — not a code defect:

- the offending path measured **269 characters**;
- `react-native-reanimated`'s C++ tree is deep and lives under `node_modules`,
  and CMake mirrors the absolute source path into its object filenames, so the
  project path is counted **twice**;
- `LongPathsEnabled` is already `1`, but the SDK's bundled `ninja` is **1.10.2**,
  which predates long-path awareness — so the registry setting cannot help.

**Fix (adopted):** replace the SDK's bundled ninja with **1.13.2**, which honours
long paths. Path: `%LOCALAPPDATA%\Android\Sdk\cmake\3.22.1\bin\ninja.exe`; the old
binary is kept as `ninja.exe.1.10.2.bak`. `tools/android-build.ps1` verifies and
re-applies this automatically.

**`subst` (a short `R:\` drive) was tried and REJECTED.** It did get past
MAX_PATH — Node's `realpath` and Java's `getCanonicalPath()` do not resolve
`subst` mappings, so CMake recorded a short path — but it then broke Expo's
autolinking: `expoAutolinking.useExpoModules()` (`settings.gradle` line 32) failed
with `Process 'command 'cmd'' finished with non-zero exit value 1` at
`ExpoAutolinkingSettingsExtension.kt:81`. Plain `cmd` on `R:\` works (`exit=0`),
so the breakage is specific to autolinking, not to `cmd`. The mapping was removed.

Net effect: `R:\` is a dead end for this project; fix ninja instead.

## Android emulator — abandoned

An AVD (`letgo_api36`) was created and WHPX acceleration worked
(`emulator -accel-check` → usable), but the guest **never had working networking**:
only `lo` + `dummy0`, an empty `ip route`, and `Active default network: none`,
so the app could not reach the LiveKit server at all. This was reproduced across
three feature-flag variants (`-feature -Wifi`, `-feature -VirtioWifi`, and
defaults) even though `netsimd` reported "Successfully initialized netsim WiFi"
host-side. The x86_64 APK path and the AVD are therefore **dead ends** and the
physical phone is used instead.

Secondary reason: two participants on one host share the *same* microphone, so an
emulator cannot give a meaningful two-way audio test anyway.

## Test device

| | |
|---|---|
| Model | Xiaomi `24117RN76G` |
| OS | HyperOS OS1.0 / MIUI `V816` (`V816.0.7.0.UOGMIXM`), Android 14 (SDK 34) |
| ABIs | `arm64-v8a`, `armeabi-v7a`, `armeabi` |
| Wi-Fi IP | `192.168.3.93` (host is `192.168.3.16`) |
| adb serial | `rgyhbqvgcm69nfmn` |

### MIUI gates ADB work

- **"Install via USB"** — required before `adb install`; without it the install
  fails with `INSTALL_FAILED_USER_RESTRICTED`. Now enabled by the user.
- **"USB debugging (Security settings)"** — still OFF. While off, `adb` may not
  `pm grant` runtime permissions (`SecurityException: ... Neither user 2000 nor
  current process has android.permission.GRANT_RUNTIME_PERMISSIONS`) or inject
  input (`SecurityException: Injecting input events requires ... INJECT_EVENTS`).
  Consequences: the microphone prompt must be accepted **on the device**, and the
  phone UI cannot be driven from the host.
- Real devices resolve the dev server to `localhost`, so
  `adb reverse tcp:8081 tcp:8081` is required for Metro.

## Dev-screen routing bug found during this work

`src/app/_layout.tsx` rendered `NativeTabs` directly as the root layout with only
`index` and `explore` triggers. With no `<Stack>` above the tabs, `dev/rtc-spike`
had **no navigator to render into** — the deep link and the in-app link were both
silently no-ops, so the P2 spike screen had never actually been reachable on a
device.

Fixed by moving the tabs into a `(tabs)` route group and making the root a stack:

```text
src/app/_layout.tsx          -> <Stack>
src/app/(tabs)/_layout.tsx   -> <AppTabs /> (NativeTabs)
src/app/(tabs)/index.tsx
src/app/(tabs)/explore.tsx
src/app/dev/rtc-spike.tsx    -> pushed onto the root stack
```

Generated routes are now `/(tabs)`, `/`, `/explore`, `/dev/rtc-spike`.

## Bundling performance — React Compiler disabled

`app.json` ships with `experiments.reactCompiler` set to **`false`** (the Expo
template default is `true`). With it on, a cold Android bundle did not finish
after **30+ minutes** and Metro's throughput collapsed; with it off the same cold
bundle completes in **~2.5 min** (2023 modules). It is a development-velocity
trade; re-enable it if render profiling shows the memoisation is worth the cost.
Note that changing it invalidates Metro's transform cache.

## Verified (evidence)

| Check | Result |
|---|---|
| `java -version` | PASS — Temurin `17.0.20.1+1` |
| `sdkmanager --licenses` | PASS — all SDK licenses accepted |
| `adb version` | PASS — 1.0.41 |
| LiveKit server boots | PASS — `GET /` returns `OK`, listening on 7880 |
| Minted token accepted | PASS — `GET /rtc/validate?access_token=…` → **200 `success`** |
| Bogus token rejected | PASS — `.../rtc/validate` → **401** |
| `applicationId` after prebuild | `com.letgo.app` |
| **arm64 debug APK builds** | PASS — `BUILD SUCCESSFUL in 18m 16s`, 96.3 MB, `android/app/build/outputs/apk/debug/app-debug.apk` |
| APK contains LiveKit WebRTC | PASS — `liblkjingle_peerconnection_so.so`; manifest has `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `INTERNET`, `BLUETOOTH` |
| APK installs on device | PASS — `adb install -r` → `Success` |
| App launches on device | PASS — `com.letgo.app/.MainActivity` resumed |
| RN bundle builds for Android | PASS — 2023 modules / 10.9 MB |
| Dev screen reachable via deep link | PASS — `letgo:///dev/rtc-spike?token=…` routes and prefills the token |
| `EXPO_PUBLIC_LIVEKIT_URL` reaches bundle | PASS — screen showed `ws://192.168.3.16:7880` |
| **RTC connect on physical device** | PASS — `connecting -> connected`, server `1.13.10` |
| **ICE + DTLS** | PASS — `ice: connected`, `dtls: connected`, `network: wifi`, `route: host/udp -> host`, RTT **11 ms** |
| **Microphone published** | PASS — `codec: audio/opus`, `bytesSent: 271619`, `audioLevel: 0.015` |
| **Remote participant discovered** | PASS — screen rendered `participants: 2` → `phone-a (you) mic on`, `bot-b` |
| Room survives backgrounding | PASS — room still showed 1 participant/1 publisher while the app was backgrounded |
| `npm run typecheck` / `lint` / `test` | PASS — lint 0 problems, tests 6/6 |
| `npx prettier --check .` | PASS |

## Still NOT TESTED

- **Mute / unmute / leave** button behaviour on-device (buttons are on screen and
  wired to the adapter, but tapping was not automated — see the MIUI gate above).
- **Audible audio in both directions between two humans.** Publishing is proven;
  hearing a remote peer is not, and the `lk` bot publishes a synthetic track.
- **Reconnect** after a real network drop, **Bluetooth** routing, and sustained
  background operation (only a short background interval was observed).
- **iOS** — cannot be built on Windows; needs a Mac.
- **New Architecture** support of `@livekit/react-native-webrtc@150` under RN 0.88
  is confirmed at compile time and at runtime on Android, but not on iOS.

## Notes / risks

- The `android/` and `ios/` folders are generated by Expo Prebuild and are
  git-ignored; native config lives in `app.json` (Continuous Native Generation).
- Build one ABI at a time with `-Abi` (`arm64-v8a` for the phone, `x86_64` for an
  emulator); building all four quadruples the C++ compile time.
- LiveKit dev credentials are intentionally public and insecure. Before any
  shared/staging use, replace with a real key/secret kept server-side.
- `machina@7.0.1` (LiveKit dependency) declares `node >=22.22`; this machine runs
  22.16 and installs with a warning only.
