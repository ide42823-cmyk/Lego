# Project Status â€” Social Voice App (Letgo)

> Persistent status memory. Update this file at the end of every approved task. Facts only; unknown values must stay marked unknown.

## Product
- Build an original iOS/Android social discovery and live voice-room app inspired by the provided SUGO reference screenshots (JPEGs under `reference_screenshots/`, gitignored â€” count 103 files as of 2026-10-23, mapping to screen IDs still to be verified).
- Core areas built so far: discovery (Home), moments feed, profiles, rankings, search + filters, rooms directory, messages inbox, conversation thread, Me dashboard. Voice rooms (RTC), wallet/SVIP/couples, and delivery are backend-phase territory.

## Source-of-truth documents
- `README_AI_START_HERE.md` (repo root)
- `MASTER_AI_CODING_PROMPT.md` (repo root)
- `sugo_inspired_app_architecture_and_flows.md` (repo root)
- `sugo_screen_by_screen_analysis.md` (repo root)
- `REPEATABLE_TASK_GATE_PROMPT.md` (repo root)
- `PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md` (repo root)
- Detailed design ADRs: `docs/decisions/0001`â€“`0004`
- Original JPEG screenshots: `reference_screenshots/`

## Current state
- Current phase: **Page-by-page front-end passes** (the historical Phase 0 audit is complete; see `PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md` and `docs/decisions/`).
- Git branch/commit at last verification: `main`, through `84eb5fe` (T007 Room Details ce5fd27 + gitignore 84eb5fe), pushed to `origin/main`.
- Approved work in progress: **None.** Last completed: T008 gift panel, committed as `45b8361` and pushed (T009).
- Pending device verifications (no approval needed, next cable session): room shell `04-room-device.png` + a details-sheet deep-link pass.
- Next proposed task (needs approval): commit T008; then pick - room tools drawer (reference 013, the `apps` button) or a strictly-backend page.
- KNOWN_ISSUES #9 (uncommitted work) resolved; #11 (MIUI foreground/deep-link workaround) recorded 2026-10-23.
- User approval required before new source changes: **Yes** (the user's standing instruction is one page/pass at a time).

## Approval gate
Do not start a new surface (room shell, wallet, SVIP, couples) or change architecture without explicit approval. Do not record planned work as completed.

## Completed milestones (summary)
- P1â€“P8: design system, data seam, fixtures, bottom-bar shell, discovery, moments, rooms, Me, person profile, RTC spike. Details: `docs/decisions/`.
- P9: Ranking page + device pass. P10: Home fidelity + device pass (Xiaomi, light+dark). P11: Search location gate. P12: Messages inbox fidelity (favorites chip, inbox clock, notification card, promo member stack). P13 (first cut): `/thread/[id]` thread with two-party bubbles, honest composer; native crash from web-only `accessibilityRole="form"` fixed and verified on device.
- T002: typography/icon audit delivered read-only. T003: Cairo bundled + type scale retuned + icon fill/stroke policy (bell/gift/heart filled, stroke 2.25). T004: commit gate â€” all three earlier deliverables pushed (`7007561` + config/memory commit). T005: room shell (`/room/[id]`, captures at `Temp\opencode\thread-p1\room-*.png`, device pass pending).
- Full verification history lives in `WORK_LOG.md` and the kit's ADRs under `docs/decisions/`.

## 2026-10-23 (post-T010)
- Approved work in progress: **None.** Last completed: T010 room tools drawer (reference 013) - web-verified, 240 tests PASS; NOT yet committed.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer.
- Next proposed task (needs approval): commit T010; then pick - strictly-backend page (wallet/SVIP/couples) or messages inbox from room context (reference 014).

## 2026-10-23 (post-T011)
- Approved work in progress: **None.** Last completed: T010 room tools drawer, committed as `a17b1c7` and pushed (T011). Working tree clean; `origin/main` in sync.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer.
- Next proposed task (needs approval): strictly-backend page (wallet/SVIP/couples) or messages inbox from room context (reference 014).

## 2026-10-24 (post-T012)
- Approved work in progress: **None.** Last completed: T012 room chat sheet (reference 014) - web-verified, 243 tests PASS; NOT yet committed.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet.
- Next proposed task (needs approval): commit T012; then pick - strictly-backend page (wallet/SVIP/couples) or reference 015 polish.
- KNOWN_ISSUES #12 (Metro watcher hang) recorded 2026-10-24.

## 2026-10-24 (post-T013)
- Approved work in progress: **None.** Last completed: T013 hugeicons swap (all screens keep the meaning-named Icon API; lucide-react-native removed) - 243 tests PASS; NOT yet committed.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet + the icon swap (visual audit on device).
- Next proposed task (needs approval): commit T013; then pick - strictly-backend page (wallet/SVIP/couples) or reference 015 polish.

## 2026-10-24 (post-T014)
- Committed `bd8389c` "Icons T013: swap the app icon system to hugeicons" — carries BOTH the T013 icon swap and the earlier-uncommitted T012 chat sheet (the T012 surface was already user-approved; flagged honestly here). Pushed to `origin/main`.
- Committed `17f102d` "Wallet T014: My Diamonds exchange page against reference 057" (10 files, +485/-3) pushed to `origin/main`. Working tree clean.
- Last completed: **T014 My Diamonds wallet exchange (reference 057)** - `/wallet/diamonds` route + seam/fixture/tests + Me-tools routing; balance and rates display-only, tier/record presses toast; 247 tests PASS.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet, icons swap, wallet page.
- Next proposed task (needs approval): pick - the couples/relationship chooser (reference 016) or the SVIP hub references.

