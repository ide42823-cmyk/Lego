# Project Status — Social Voice App (Letgo)

> Persistent status memory. Update this file at the end of every approved task. Facts only; unknown values must stay marked unknown.

## Product
- Build an original iOS/Android social discovery and live voice-room app inspired by the provided SUGO reference screenshots (JPEGs under `reference_screenshots/`, gitignored — count 103 files as of 2026-10-23, mapping to screen IDs still to be verified).
- Core areas built so far: discovery (Home), moments feed, profiles, rankings, search + filters, rooms directory, messages inbox, conversation thread, Me dashboard. Voice rooms (RTC), wallet/SVIP/couples, and delivery are backend-phase territory.

## Source-of-truth documents
- `README_AI_START_HERE.md` (repo root)
- `MASTER_AI_CODING_PROMPT.md` (repo root)
- `sugo_inspired_app_architecture_and_flows.md` (repo root)
- `sugo_screen_by_screen_analysis.md` (repo root)
- `REPEATABLE_TASK_GATE_PROMPT.md` (repo root)
- `PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md` (repo root)
- Detailed design ADRs: `docs/decisions/0001`–`0004`
- Original JPEG screenshots: `reference_screenshots/`

## Current state
- Current phase: **Page-by-page front-end passes** (the historical Phase 0 audit is complete; see `PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md` and `docs/decisions/`).
- Git branch/commit at last verification: `main`, app work at `7007561` ("Thread P13 full-match rework + Cairo typography pass") plus the config/memory commit on top, pushed to `origin/main`.
- Approved work in progress: **Room shell T005** — the live room canvas (`/room/[id]`) built against reference 015/002: host pill + power/exit overlay, rank + ticker + free-draw banners, ten numbered seats, audience strip, chat overlay (pinned welcome, introduction, event notices with GO), floating event card, composer with 99+ bubble badge and gold gift. All money/sound actions toast-gated. Room cards now open the room instead of toasting. Verified: typecheck, lint, 230 tests, web light/dark/exit-overlay captures with zero console errors. Device pass pending (phone left adb mid-task).
- Next proposed task (needs approval): **commit the room shell**, then choose the next surface (Room Details sheet from ref 003, or a strictly-backend page).
- KNOWN_ISSUES #9 (uncommitted work) resolved; #11 (MIUI foreground/deep-link workaround) recorded 2026-10-23.
- User approval required before new source changes: **Yes** (the user's standing instruction is one page/pass at a time).

## Approval gate
Do not start a new surface (room shell, wallet, SVIP, couples) or change architecture without explicit approval. Do not record planned work as completed.

## Completed milestones (summary)
- P1–P8: design system, data seam, fixtures, bottom-bar shell, discovery, moments, rooms, Me, person profile, RTC spike. Details: `docs/decisions/`.
- P9: Ranking page + device pass. P10: Home fidelity + device pass (Xiaomi, light+dark). P11: Search location gate. P12: Messages inbox fidelity (favorites chip, inbox clock, notification card, promo member stack). P13 (first cut): `/thread/[id]` thread with two-party bubbles, honest composer; native crash from web-only `accessibilityRole="form"` fixed and verified on device.
- T002: typography/icon audit delivered read-only. T003: Cairo bundled + type scale retuned + icon fill/stroke policy (bell/gift/heart filled, stroke 2.25). T004: commit gate — all three earlier deliverables pushed (`7007561` + config/memory commit). T005: room shell (`/room/[id]`, captures at `Temp\opencode\thread-p1\room-*.png`, device pass pending).
- Full verification history lives in `WORK_LOG.md` and the kit's ADRs under `docs/decisions/`.
