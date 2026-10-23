# AI Work Log

> Append one concise entry at the end of each task. Record only real actions and outputs. Keep the latest 12 completed task entries detailed; summarize older entries under "Older work summary" if this file grows.

## Task entry template

### YYYY-MM-DD — TNNN: <task title>
- **Approval/scope:** user-approved scope; include explicit approval state.
- **References inspected:** screen IDs and image filenames, or not applicable with reason.
- **Files changed:** list paths and purpose.
- **Verification actually run:** exact commands and PASS/FAIL/NOT TESTED outcomes.
- **Review findings:** bugs fixed, duplication/architecture/accessibility/security/performance considerations.
- **Decisions or issues:** link to ADR or known issue.
- **Result:** complete / partial / blocked.
- **Next proposal:** one bounded task; do not begin it without approval.
- **Stopped for approval:** yes/no.

## Initial entry

### 2026-10-23 — T000: Persistent OpenCode rules scaffold prepared
- **Approval/scope:** Scaffold for user review; this is not evidence that the kit has been installed into the user's app repository.
- **References inspected:** Project filenames and published OpenCode documentation for persistent `AGENTS.md` rules and the `instructions` configuration were checked when preparing the kit.
- **Files changed:** This kit contains a proposed root `AGENTS.md`, `opencode.json`, and project memory templates. The user's application repository has not been changed by this artifact.
- **Verification actually run:** JSON syntax was validated when the kit was packaged. Project integration still needs to be performed in the user's actual repository.
- **Result:** Ready for integration/review.
- **Next proposal:** Ask OpenCode to merge these rules carefully into the actual repository, verify its config, and run the read-only Phase 0 audit only.
- **Stopped for approval:** yes.

## Older work summary (pre-kit history, reconstructed from the repository and chat record — details live in `docs/decisions/` and the Git log)

- **P1–P8:** design system, fixture data seam, tab shell, discovery, moments, rooms, Me, person profile. See `docs/decisions/0001`–`0002`.
- **P9 (2026-10-22):** Ranking page; device pass on Xiaomi (`rgyhbqvgcm69nfmn`). Commit `6948b2e` also contains P11.
- **P10:** Home fidelity pass; verified light+dark on device; night mode restored. `docs/decisions/0004`.
- **P11 (`6948b2e`):** Search location gate on the People landing; emulated-media capture quirk documented (re-apply scheme after `Page.navigate`).
- **P12 (`a3fe0a2`):** Messages inbox fidelity — favorites chip, `formatInboxTime` (Yesterday / `DD-MM-YY`), notification card, promo member stack.
- **P13 (`37f2212`)**: `/thread/[id]` thread; **P13 fix (`90fd8f7`)**: web-only `accessibilityRole="form"` redboxed Android and blocked inbox→thread navigation; fixed and verified on device (force-stop → fresh bundle → deep link `letgo:///thread/conversation-1`).
- Standing verification pattern per pass: `npm run typecheck`, `npm run lint`, `npx jest`, web captures (headless Chrome CDP, 384×853, light+dark), device screencaps via `adb pull` (PowerShell mangles `adb exec-out` binaries).

## Recent tasks

### 2026-10-23 — T001: Persistent OpenCode instructions + project memory installed
- **Approval/scope:** User-approved configuration-only task (no app source changes). User also pre-authorized a follow-up read-only typography/icon audit.
- **References inspected:** Not applicable (no UI change). Screenshot directory verified to exist with 103 JPEGs; count only, no inspection yet.
- **Files changed:** `AGENTS.md` (kit protocol merged as "Part 2"; original Expo rules preserved verbatim), `opencode.json` (new — kit's `instructions` list), `docs/ai-memory/PROJECT_STATUS.md`, `docs/ai-memory/WORK_LOG.md`, `docs/ai-memory/KNOWN_ISSUES.md`, `docs/ai-memory/ARCHITECTURE_DECISIONS.md` (all new, seeded with the kit's T000 history plus the repository's true current state), backup `AGENTS.md.bak` (review remaining; delete after acceptance).
- **Verification actually run:** `git status -sb` (clean tree at `90fd8f7` before this task; two modified app files from the in-progress P13 rework were left untouched), `Test-Path` checks for `AGENTS.md`/`opencode.json`/`docs\ai-memory`, JPEG count check (103). `opencode.json` JSON validation PASS (`ConvertFrom-Json`: 3 instruction paths resolved; files not gitignored per `git check-ignore`; git status shows `M AGENTS.md`, `?? opencode.json`, `?? docs/ai-memory/`).
- **Decisions or issues:** Kit templates claimed "Phase 0 — not started"; reconciled with the real repository state (P13 in progress) instead of recording a false status. Global OpenCode config (`%USERPROFILE%\.config\opencode\`, `service.json` only) deliberately untouched; the kit's config went to the project root where OpenCode reads it.
- **Result:** complete.
- **Next proposal:** read-only typography and icon audit across the 103 reference screenshots vs. the app's tokens (`src/constants/theme.ts`) and icon vocabulary (`src/components/ui/icon.tsx`) — user-approved in the same message.
- **Stopped for approval:** yes (for the *install*; the audit is separately pre-authorized).

### 2026-10-23 — T002: Typography + iconography audit vs. reference set (read-only)
- **Approval/scope:** pre-authorized by the user in the same message as T001 ("make sure fonts and icons in reference images match our app"). Read-only audit; no app source touched.
- **References inspected:** `WhatsApp Image 2026-10-18 at 14.47.22.jpeg` (Home/Recommend, ID Home), `…14.46.55 (19).jpeg` (conversation thread, ID Messages-thread), `…14.46.55 (8).jpeg` (Store, ID Wallet-Store). Plus the session's earlier inspections of the inbox, profile, rooms, rank and SVIP sets.
- **Files changed:** memory files only (this log, `PROJECT_STATUS.md`, `KNOWN_ISSUES.md`).
- **Verification actually run:** visual inspection of 3 screenshots fresh this pass + token sources `src/constants/theme.ts` and `src/components/themed-text.tsx` read from disk. No screenshot was copied into the app.
- **Review findings:** see KNOWN_ISSUES #8 (findings). Gaps: system font + weight-500 defaults vs. reference's rounded heavy font (Latin/Arabic, 600–900 weights); caption sizes 12–13 bold in ref vs. our 14/500; heading weights; icons outline-Lucide vs. reference's predominantly solid, custom glyph art.
- **Result:** complete (audit). Implementation pending approval.
- **Next proposal:** approved-scope typography pass (bundle an open rounded family such as Cairo/Nunito with weight tiers, retune type scale + icon stroke/fill policy). NOT started.
- **Stopped for approval:** yes.

### 2026-10-23 — T003: Typography + icon policy pass implemented (Cairo bundled)
- **Approval/scope:** user-approved with "do it to see first" — implement the T002 proposed fix so it can be seen. No commit yet; commit gate still open.
- **References inspected:** same set as T002 (Home, thread, Store) plus earlier session inspections; no screenshot copied.
- **Files changed:** `src/constants/typography.ts` (new — `TYPEFACES` registry + `typefaceForWeight` mapping 400/500/600/700('bold')/800/900 → Cairo static faces), `src/app/_layout.tsx` (`useFonts(TYPEFACES)`; shell gated to `null` until loaded so no screen ever lays out with the OS fallback), `src/components/themed-text.tsx` (family derived from the *flattened* style's `fontWeight`, so every inline 700/800 across the app picks its true face automatically; caption tier retuned `small`/`smallBold` 14→13 with lineHeight 20→19), `src/components/ui/icon.tsx` (default strokeWidth 2→2.25 to match the reference's heavier glyph art), `src/app/(tabs)/messages.tsx` (notification-card bell drawn filled `fill={theme.brand}`), `src/components/chat/chat-composer.tsx` (toolbar gift gold-filled), `src/components/chat/thread-profile-card.tsx` (intimacy glyph moved from thumbs-up `like` to `greeting`/heart), `src/components/chat/chat-thread.test.tsx` (test-only: `as React.ReactElement` cast → `as never` for a fireEvent instance type), `package.json`+lock (adds `expo-font ~58.0.9`, `@expo-google-fonts/cairo ^0.4.2` via `npx expo install`).
- **Verification actually run:** `npm run typecheck` PASS (after the test-cast fix), `npm run lint` PASS (no output), `npx jest` **21 suites / 217 tests PASS** (12.9s). Web captures light+dark via `capture-thread.js` (thread + home) — Cairo renders, all thread probes true (card/photos/stamps/translate×3/draft/send/toolbar), overflow false. Device pass: foregrounding was fought by MIUI until `am start -f 0x18000000` (NEW_TASK+CLEAR_TOP) worked; deep link `letgo:///thread/conversation-1` captured at `Temp\opencode\device-thread\06-cairo-thread.png` — Cairo confirmed on device for Latin + Arabic, heart/level pill, gold-filled gift, stamps, translate rings, ornate viewer frames all correct.
- **Review findings:** font-family inheritance into nested Text is native (RN cascades inheritable text props), so the ThemedText auto-weight trick covers compound texts without touching callers. Unread pill correctly absent for `conversation-1` (0 unread); verified on web earlier.
- **Decisions or issues:** 900/800 map to ExtraBold per reference look; Black reserved for 950. See KNOWN_ISSUES #8 (now implemented), new #11 (MIUI foreground behavior).
### 2026-10-23 — T004: Commit gate opened (user approved "ok do it")
- **Approval/scope:** user approved committing the three uncommitted deliverables and deleting `AGENTS.md.bak`.
- **Files changed / actions:** `AGENTS.md.bak` deleted. Commit `7007561` = P13 full-match thread rework + T003 Cairo typography/icon pass as ONE app commit (23 files, +863/−316) — the two tasks were entangled in the reworked chat files (`chat-composer.tsx`, `thread-profile-card.tsx`, `chat-thread.test.tsx` carry edits from both). Config/memory committed separately right after (see `git log`). `opencode_sugo_persistent_memory_kit/` and `…kit.zip` deliberately left untracked (installer artifacts, not project source — gitignore decision deferred to the user).
- **Verification:** `git status -sb` staged-file review before each commit; push + sync check after (recorded in PROJECT_STATUS). No code changed in this task.
- **Result:** complete.
- **Next proposal:** with the tree clean, pick the next surface with the user (room shell vs. strictly-backend pages); optionally gitignore the kit artifacts.
- **Stopped for approval:** yes (for the next surface choice).
