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
- Detailed design ADRs: `docs/decisions/0001`—`0004`
- Original JPEG screenshots: `reference_screenshots/`

## Current state
- Current phase: **Page-by-page front-end passes** (the historical Phase 0 audit is complete; see `PHASE_0_PRELIMINARY_AUDIT_AND_SETUP.md` and `docs/decisions/`).
- Git branch/commit at last verification: `main`, through `92990db` (T016-T019 membership hub + room polish + VIP rework), pushed to `origin/main`.
- Approved work in progress: **None.** Last completed: T008 gift panel, committed as `45b8361` and pushed (T009).
- Pending device verifications (no approval needed, next cable session): room shell `04-room-device.png` + a details-sheet deep-link pass.
- Next proposed task (needs approval): commit T008; then pick - room tools drawer (reference 013, the `apps` button) or a strictly-backend page.
- KNOWN_ISSUES #9 (uncommitted work) resolved; #11 (MIUI foreground/deep-link workaround) recorded 2026-10-23.
- User approval required before new source changes: **Yes** (the user's standing instruction is one page/pass at a time).

## Approval gate
Do not start a new surface (room shell, wallet, SVIP, couples) or change architecture without explicit approval. Do not record planned work as completed.

## Completed milestones (summary)
- P1—P8: design system, data seam, fixtures, bottom-bar shell, discovery, moments, rooms, Me, person profile, RTC spike. Details: `docs/decisions/`.
- P9: Ranking page + device pass. P10: Home fidelity + device pass (Xiaomi, light+dark). P11: Search location gate. P12: Messages inbox fidelity (favorites chip, inbox clock, notification card, promo member stack). P13 (first cut): `/thread/[id]` thread with two-party bubbles, honest composer; native crash from web-only `accessibilityRole="form"` fixed and verified on device.
- T002: typography/icon audit delivered read-only. T003: Cairo bundled + type scale retuned + icon fill/stroke policy (bell/gift/heart filled, stroke 2.25). T004: commit gate — all three earlier deliverables pushed (`7007561` + config/memory commit). T005: room shell (`/room/[id]`, captures at `Temp\opencode\thread-p1\room-*.png`, device pass pending).
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

## 2026-10-24 (post-T017, awaiting one commit gate for both)
- Last completed: **T016 membership hub (reference 040)** - `/membership/[family]` black/gold page (VIP/SVIP family tabs, level crest band, privilege highlight cards with Pack up, points panel, 2-col gold-borders store grid with level chips + prices + 7 Day); VIP/SVIP tile on Me routes to it; ladders/prices display-only, buy/help/records gated; VIP3 rings as the held level (mirrors FIXTURE_ME), SVIP holds none. **T017 live-room conversation polish (reference 015)** - winner marquee ribbon now renders the seam's `ticker.headline` above the rank/draw row; composer's 99+ unread badge seam-driven (`chatUnread`); red announcement dot on the utilities control (`toolsAttention`); room-1 busy/other rooms quiet so both badge states render.
- Verification: typecheck PASS, lint PASS, jest **33 suites / 260 tests PASS**; captures `31-membership-svip.png.png`, `32-membership-vip.png.png`, `33-room-conversation.png.png` (real user paths, gates toast, zero console problems).
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet, icons swap, wallet page, relationship chooser, membership hub, room conversation polish.
- Next proposed task (needs approval): pick - the per-tier membership detail pages (shared template, references 044-053) or the Aristocracy hub (references 038/039).
- KNOWN_ISSUES #12 (Metro watcher hang) recurred 2026-10-24 (blank silent pages on two routes) - workaround (kill 8081 PID, restart without `--clear`, `metro-web13.log`) restored both routes.


## 2026-10-24 (post-T015)
- Committed `71d1eef` "Relationships T015: relationship-type chooser over the profile against references 016/017/020" (11 files, +664/-2) pushed to `origin/main`. Working tree clean.
- Last completed: **T015 relationship-type chooser (references 016/017/020)** - RelationshipTypeSheet over the person profile from the Relationships tab's invite tile; Couple/Friend pills switch the card in place (per-kind fixed pastel palettes); coin prices + 24-hour terms display-only; invite/Help gated; + `heart` icon meaning; 252 tests PASS.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet, icons swap, wallet page, relationship chooser.
- Next proposed task (needs approval): pick - the SVIP hub references or reference 015's live-room conversation-state polish.
- KNOWN_ISSUES #12 (Metro watcher hang) recurred 2026-10-24 (blank silent pages on two routes) - workaround (kill 8081 PID, restart without `--clear`, `metro-web13.log`) restored both routes.



## 2026-10-24 (post-T018, same combined commit gate as T016 + T017)
- Last completed: **T018 VIP family page against references 045-050** - the membership hub is now a family dispatcher: `membership-svip-hub.tsx` keeps the reference-040 black/gold page, `membership-vip-hub.tsx` is the new warm VIP page (hero with avatar/name/heart + selected-rung requirement + own-shape crest with Locked/Current chip + Recharge pill; windowed diamond rail clamped to selected +-2; "VIPn Benefits (x/17)" 3-column matrix with rung lock chips; first-six collapse with Expand More / Pack up; VIPStore + View More; My Points; store grid). Types split into the `MembershipVipHub` / `MembershipSvipHub` union; VIP ladder is 16 rungs (VIP2 = 16000 and VIP16 = 8742264000 pinned to the references) with 17 benefits unlocking 12/13/14/17 per the frames; crest is our own crown + name-band geometry.
- Fixture honesty: the viewer holds VIP (dashboard "Active"), so VIP1 is the current rung - its crest reads "Current" and its line "Recharge any amount to keep VIP!"; every other rung shows the reference's Locked chip and XP line. SVIP still holds no rung.
- Verification: typecheck PASS, lint PASS, jest **34 suites / 265 tests PASS**; captures `34-vip1-top.png`, `35-vip3-top.png`, `36-vip3-expanded-bottom.png`, `37-vip16-top.png`, `38-vip16-expanded-bottom.png` (12/17, 14/17 + three lock chips, 17/17, rail windows, gates toast, no overflow, zero console problems). Device pass on the Xiaomi confirms both family pages render full-bleed with real insets (`device-08/10/11/12.png` in `Temp\opencode\`).
- Device-only fix recorded: the root Stack registers screens explicitly, so `wallet/diamonds` and `membership/[family]` were rendering under the native default header on the phone; both are now registered with `headerShown: false` (web captures never show this).
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet, icons swap, wallet page (header fix included), relationship chooser, membership hub (both families), room conversation polish. Deep-scroll states on device stay visually verified via the web captures because MIUI blocks injected swipes.
- Next proposed task (needs approval): the per-tier membership detail pages (shared template, references 044-053) or the Aristocracy hub (references 038/039).

## 2026-10-25 (post-T019, same combined commit gate as T016 + T017 + T018)
- Committed `92990db` "Membership T016-T019: SVIP/VIP family hub, live-room conversation polish, VIP backdrop, badges and five-rung rail against references 015/040/045-050" (28 files) and pushed to `origin/main`.
- Last completed: **T019 VIP backdrop, badges, rail and display face** - the supplied `Sprites/background/vip_background.png` now paints the whole screen behind the page (opacity 33% at VIP1-4, 66% at VIP5-8, 100% from VIP9, with a 42%-tall wash into the page colour); the supplied `Sprites/Badges/VIP Crown Badge Collection.png` replaces the placeholder crest (one 4 x 4 sheet cropped per rung by `membership-badge.tsx`, used in the hero and the Exclusive Badge tile); the rail always shows five rungs clamped to the ladder's ends and draws its names in the supplied `calfimer-masquet` face at 14; Recharge is a 12-radius rect and the lock/current/store chips are 6-radius. The full sixteen-frame XP ladder is now pinned exactly (16000 … 8742264000) and printed as raw digits, matching the references.
- Fixture/data: `MembershipVipHub.hero.backgroundUrl` carries `asset:media/backgrounds/vip-hero.png`; `membership-crest.tsx` deleted; `mediaRef` accepts a file extension; display face registered in `typography.ts` and loaded in `_layout.tsx`.
- Verification: typecheck PASS, lint PASS, jest **34 suites / 265 tests PASS**; captures `34-vip1-top.png` … `38-vip16-expanded-bottom.png` show the five-marker rail (VIP1-5, VIP12-16), the badge art, the new radii and the tiered backdrop; a CDP probe confirms the display face is loaded and applied; zero console problems. **Device pass blocked:** no ADB device attached this session.
- Process notes: PowerShell `Set-Content -Encoding utf8` added a BOM/double-encoded dashes (stripped/repaired); `expo start` under `CI=1` disables the file watcher and served a stale bundle until restarted without CI.
- Pending device verifications (no approval needed, next cable session): room shell, details sheet, gift panel, tools drawer, chat sheet, icons swap, wallet page (header fix included), relationship chooser, membership hub (both families, incl. the new backdrop/badges/display face), room conversation polish.
- Next proposed task (needs approval): the per-tier membership detail pages (shared template, references 044-053) or the Aristocracy hub (references 038/039).
