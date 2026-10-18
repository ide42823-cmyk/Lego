# 0002 — RTC provider spike (P2)

**Date:** 2026-10-18
**Status:** Partially verified — provider selected provisionally; on-device audio NOT TESTED
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
  mute / leave). Reachable from Home behind `__DEV__`.

## Verified (evidence)

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | 5/5 PASS |
| `npx prettier --check .` | PASS |
| `npx expo export --platform ios` | PASS — Metro bundles the LiveKit graph (5.7 MB Hermes bundle vs 3.7 MB before) |
| `npx expo config --type introspect` | PASS — resolved native config contains `NSMicrophoneUsageDescription`, `NSCameraUsageDescription`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `CAMERA`, and the `react-native-webrtc` plugin |

## NOT TESTED (and why)

- **Native dev build** — this Windows machine has **no JDK, no Android SDK, no
  `adb`**, and iOS cannot be built off macOS. Therefore no APK/IPA was produced.
- **Multi-user audio, mute/unmute, Bluetooth routing, background, reconnect** —
  require ≥2 physical devices and a running LiveKit server/Cloud key.
- **New Architecture support** for `@livekit/react-native-webrtc@150` under RN 0.88
  is unconfirmed.

## Risks / notes

- `machina@7.0.1` (LiveKit dependency) declares `node >=22.22`; this machine runs
  22.16. Installed with a warning; may matter at native build time.
- The provider choice is provisional until the device spike passes.

## How to finish P2 (requires a different machine)

1. Install JDK 17 + Android Studio/SDK (and/or use a Mac for iOS).
2. `npx expo run:android` (or `eas build --profile development`).
3. Start a LiveKit server or LiveKit Cloud project; issue short-lived tokens.
4. Open the dev link on Home, connect two devices, verify connect / mute /
   unmute / reconnect / leave, then record results here.
