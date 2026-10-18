# 0001 — Project foundation (P1)

**Date:** 2026-10-18
**Status:** Accepted (pending user review of P1)
**Phase:** P1 — minimal project foundation

## Context

The repository began as a specification bundle only (documents + 100 reference
JPEGs) with no application. P1 establishes a runnable, verified baseline before
any product feature work.

## Decisions

1. **Expo SDK 58** (`expo ~58.0.14`, React Native 0.88.0, React 19.3.0,
   `expo-router ~58.0.23`). SDK 58 is the newest stable release (2026-10-15) and
   was the scaffolder default, matching the master prompt rule "newest stable
   compatible SDK". Compatibility with the RTC and purchase libraries is **not
   yet proven** and is the subject of P2; a downgrade to SDK 57 remains possible
   if the RTC spike fails.
2. **App lives in this repository** alongside the specification documents, so the
   coding agent can always read the docs and screenshots in the same workspace
   (required by `MASTER_AI_CODING_PROMPT.md`). A monorepo `server/` workspace is
   deferred until a backend is planned.
3. **TypeScript strict mode** (from the Expo template) plus `types: ["jest"]` in
   `tsconfig.json` so test globals typecheck.
4. **Tooling:** ESLint via `eslint-config-expo` flat config, Prettier
   (single quotes, 100-col, trailing commas), Jest via `jest-expo` with
   `@testing-library/react-native` available for component tests.
5. **Env validation** centralized in `src/core/config/env.ts`; only
   `EXPO_PUBLIC_*` values are read. `.env` is git-ignored.
6. **`expo-env.d.ts` is committed** (removed from `.gitignore`) so `npm run
   typecheck` is deterministic in CI without first running an Expo command.

## Consequences / deferred

- Product name, brand and palette are still placeholders (`lego-scaffold`).
- No screens, RTC, backend or purchases exist yet.
- Upstream template defects were fixed: a `TabTriggerSlotProps` ref-type drift
  in `app-tabs.web.tsx`, and a `setState`-in-effect hydration hook replaced with
  `useSyncExternalStore` in `use-color-scheme.web.ts`.
