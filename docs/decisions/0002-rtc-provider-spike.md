# 0002 — RTC provider spike (P2)

**Date:** 2026-10-18
**Status:** DONE — provider confirmed; RTC verified end to end on a physical Android device
**Phase:** P2 — native/RTC compatibility spike

## Decision

Adopt **LiveKit** as the voice provider, with **Agora** retained as the documented
fallback. Rationale: LiveKit publishes an official Expo integration guide and an
Expo config plugin, is open-source/self-hostable (no per-minute vendor lock-in for
early development), and exposes a plain React Native WebRTC layer that fits our
`VoiceRoomAdapter` abstraction.

## What was installed / wired

- `@livekit/react-native@3.1.0`, `@livekit/react-native-webrtc@150.1.0`,
  `@livekit/react-native-expo-plugin@1.1.0`,
  `@config-plugins/react-native-webrtc`, `livekit-client@^2.20.0`.
- `app.json` plugins: `@livekit/react-native-expo-plugin` and
  `@config-plugins/react-native-webrtc` (explicit mic/camera permission copy).
- `src/core/rtc/` — vendor-agnostic `VoiceRoomAdapter` contract + LiveKit adapter
  + lazy factory. Feature code depends only on the interface.
- `src/app/dev/rtc-spike.tsx` — throwaway dev harness (URL + token → connect /
  mute / leave). Reachable from the **Me** tab's developer section behind
  `__DEV__`, or by deep link (see [0003](0003-android-toolchain-and-local-rtc.md)).

## Verified (evidence)

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | 6/6 PASS at spike time (58/58 after P3) |
| `npx prettier --check .` | PASS |
| `npx expo export --platform ios` | PASS — Metro bundles the LiveKit graph (5.7 MB Hermes bundle vs 3.7 MB before) |
| `npx expo config --type introspect` | PASS — resolved native config contains `NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `CAMERA`, and the `react-native-webrtc` plugin |
| **On-device RTC** (Xiaomi, Android 14, self-hosted server) | PASS — see [0003](0003-android-toolchain-and-local-rtc.md) |
| • connection state | `connecting -> connected` |
| • transport | `ice: connected`, `dtls: connected`, `route: host/udp -> host`, RTT **11 ms** |
| • microphone published | `codec: audio/opus`, `bytesSent: 271619`, `audioLevel: 0.015` |
| • remote participant | discovered and rendered (`participants: 2`) |
| • subscribe / downlink | 20 min receiving a remote H.264 track: `packetsLost: 0`, 218 MB |
| • reconnect after a server bounce | rejoined automatically into a new room instance in ~35 s |
| • stability | 9 min idle, zero UI state drift (host-side dump watcher) |
| • survives backgrounding | yes — still publishing while the app was backgrounded |

The **provisional provider choice is now confirmed for Android**, and the
vendor-isolation design held up: no feature code had to know that LiveKit exists.

## Still NOT TESTED (and why)

- **Mute/unmute/leave on-device** and **audible two-way audio between two humans** —
  publishing *and* subscribing are proven (see the table), but these need a human
  tap and a second human respectively, and MIUI currently blocks input injection
  from the host (see 0003).
- **Reconnect across a network change** (Wi-Fi → cellular) and **Bluetooth
  routing**. Reconnect after a transport/server loss is verified.
- **iOS** — cannot be built on Windows; needs a Mac.
- **New Architecture support** for `@livekit/react-native-webrtc@150` under RN 0.88
  is confirmed on Android at compile time *and* runtime, but not on iOS.

## Risks / notes

- `machina@7.0.1` (LiveKit dependency) declares `node >=22.22`; this machine runs
  22.16. Installed with a warning; may matter at native build time.
- The provider choice is confirmed for Android; re-check on iOS before release.

## How P2 was finished

1. Installed JDK 17 + Android SDK — see
   [`0003`](0003-android-toolchain-and-local-rtc.md).
2. Built a single-ABI debug APK with `tools/android-build.ps1` and installed it
   on a physical phone (`npx expo run:android` also works).
3. Started a self-hosted `livekit-server --dev` and minted tokens with
   `npm run rtc:token` — no vendor account required.
4. Opened `dev/rtc-spike` via deep link and confirmed connect / publish /
   subscribe. Remaining matrix items are listed under "Still NOT TESTED".
