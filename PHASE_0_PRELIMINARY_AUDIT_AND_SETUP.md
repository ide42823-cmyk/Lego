# Preliminary Phase 0 Audit and Git/GitHub Setup

**Date:** 2026-10-18  
**Status:** Project-context audit completed; application-repository audit blocked until the actual repository is available.  
**Scope:** Read-only. No application source files were created or modified, no dependencies were installed, and no GitHub repository was created.

## 1. Findings from the available project context

### Confirmed available

- `MASTER_AI_CODING_PROMPT.md` — reviewed. It requires a strict `plan → approve → implement → verify → report → stop` workflow and says Phase 0 must not modify application files, install packages, or start implementation.
- `sugo_inspired_app_architecture_and_flows.md` — reviewed for app scope, route tree, feature boundaries, data/domain model, realtime/RTC separation, security, tests and roadmap.
- `sugo_screen_by_screen_analysis.md` — reviewed. It contains 100 numbered screen entries, each with a source filename, visible structure, interaction/state clues and implementation notes.
- `reference_screenshots/` — 100 JPEGs are present; each is 720 × 1600 portrait according to the screen report. The screenshots were visually reviewed in five contact sheets covering screens 001–100. The original images remain available for detailed per-screen inspection during implementation.
- `REPEATABLE_TASK_GATE_PROMPT.md` — reviewed. It requires explicit approval for one phase only and a completion report with evidence.

### Not available / not verified

No application repository or `.git` directory is present in the workspace that I can access. There is no `package.json`, lockfile, React Native entry point, app source, backend source, test configuration, CI, EAS configuration, or GitHub remote to inspect. Therefore I cannot honestly report the current app framework/dependency versions, repository status, working-tree changes, or existing implementation conventions yet.

The available runtime reports Git `2.47.3`, but that is the execution environment, not a verification of Git on the user's Windows PC. No global Git author name/email is configured in this environment. I cannot sign in to the user's GitHub account or create a remote repository from this workspace without an authenticated account action.

## 2. Product shape inferred from the documentation and screenshots

This is not a linear set of 100 unrelated pages. The repeated component families imply a feature-oriented application with reusable shells and data-driven variations:

- Five primary tabs: Home, Moments, Rooms, Messages, Me.
- People discovery: Recommend, Nearby, New users, Featured; users open profiles and initiate a greeting/message.
- Profiles: Profile, Honor, Moments, Relationships tabs, profile details, media viewer, relationship invitation states.
- Voice rooms: discovery, details, seat grid, room chat/tools, persistent RTC session, gift picker categories and leave/keep overlay.
- Messaging: inbox, contacts, direct conversation, contextual actions, system notices and room invitations.
- Social: Moments feed and post details, family/community discovery and relationships/intimacy.
- Progression/commerce: wallet/exchange, gifts, inventory/backpack, Store, VIP/SVIP/Aristocracy, tasks, visitors, levels and events.
- Safety/settings: report/block/mute/privacy controls and settings.

A recurring design pattern is one persistent screen shell with changing data/state: many gift categories share the room, store categories share the catalog shell, membership tiers share a template, and discovery modes share list patterns. Do not implement the screenshots as 100 copies of screens.

## 3. Screenshot mapping to implementation milestones

The screen report is the authoritative mapping of all 100 IDs to original filenames. Below are the main groupings and representative exact files to consult first.

| Milestone | Screen IDs | Representative source files | Main purpose |
|---|---|---|---|
| App shell / main navigation | 075, 082, 090–094, 097–100 | `WhatsApp Image 2026-10-18 at 14.46.55 (18).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56.jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (8).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (12).jpeg`; `WhatsApp Image 2026-10-18 at 14.47.22 (1).jpeg`; `WhatsApp Image 2026-10-18 at 14.47.23.jpeg` | Five-tab structure and persistent discovery modes |
| People discovery / profiles | 001, 024–028, 097–100 | `WhatsApp Image 2026-10-18 at 14.46.50.jpeg`; `WhatsApp Image 2026-10-18 at 14.46.52 (2).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.52 (6).jpeg`; `WhatsApp Image 2026-10-18 at 14.47.22 (2).jpeg` | User lists, profile hierarchy, tabs, tags, sticky contact actions |
| Voice-room experience | 002–015, 090–094 | `WhatsApp Image 2026-10-18 at 14.46.50 (1).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.50 (2).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.51 (9).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (8).jpeg` | Room details, seats, leave flow, utilities, chat; room session must survive overlays |
| Gift UI and wallet transactions | 004–012, 057, 061–072 | `WhatsApp Image 2026-10-18 at 14.46.50 (3).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.51 (6).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55.jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55 (5).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55 (11).jpeg` | Gift picker and catalog variations; financial state must remain server-authoritative |
| Messaging and inbox | 014, 076–083, 086, 088–089 | `WhatsApp Image 2026-10-18 at 14.46.51 (8).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55 (22).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56.jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (6).jpeg` | Inbox, conversation, menu, contacts, system notice/invitation |
| Moments, relationships and communities | 016–028, 054, 076–078, 084–085, 095–096 | `WhatsApp Image 2026-10-18 at 14.46.51 (10).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.52 (2).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.54 (11).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (3).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.56 (13).jpeg` | Relationship states, feed/post, groups and intimacy |
| Memberships, inventory and utility | 029–073, 055–060, 073–075 | `WhatsApp Image 2026-10-18 at 14.46.52 (7).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.53 (10).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.54 (12).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55 (3).jpeg`; `WhatsApp Image 2026-10-18 at 14.46.55 (18).jpeg` | Data-driven tiers, tasks, visitors, levels, store, backpack and settings |

The screen report gives the exact source filename for every screen ID; during each UI task, inspect the particular original image(s), not only these representative filenames.

## 4. Git and GitHub setup on Windows

### Recommended beginner path: GitHub Desktop

1. Create or sign in to a GitHub account at <https://github.com/>. Verify the email and enable two-factor authentication. GitHub's onboarding guide covers these account steps: <https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account>.
2. Install GitHub Desktop from <https://desktop.github.com/> and sign in using **Sign in to GitHub.com**. GitHub Desktop includes Git, so you do not need a separate Git installation for this route. Official guide: <https://docs.github.com/en/desktop/installing-and-authenticating-to-github-desktop>.
3. In GitHub Desktop, create a new repository named `social-voice-app` (or your chosen original product name). Choose a local path you can find again, such as `C:\dev\social-voice-app`. Set visibility to **Private**. A README is useful; adding a Node `.gitignore` is also reasonable as a starting point, but it must be reviewed for Expo/native-build needs later.
4. Click **Publish repository** and keep it **Private**. Do not put passwords, API keys, access tokens, signing keys, store credentials, or a real `.env` file in Git.
5. In the local repository root, place these project-context files so the coding agent can read them:
   - `MASTER_AI_CODING_PROMPT.md`
   - `REPEATABLE_TASK_GATE_PROMPT.md`
   - `sugo_inspired_app_architecture_and_flows.md`
   - `sugo_screen_by_screen_analysis.md`
   - `README_AI_START_HERE.md`
   - `reference_screenshots/` with all 100 JPEGs
6. Commit these reference/context assets as a clearly named initial commit, for example `docs: add app specification and screen references`, then open the repository folder in Cursor, VS Code, or your chosen coding agent.
7. Paste the full master prompt and ask the agent to perform **Phase 0 only**. The agent must audit the repository and stop. Do not approve implementation until the report is reviewed.

### Optional Git command-line setup

If using PowerShell or Git Bash instead of GitHub Desktop, install Git from <https://git-scm.com/install/windows>. Then configure the identity for commit attribution (use the email associated with your GitHub account or the GitHub-provided noreply address if you want email privacy):

```powershell
git --version
git config --global user.name "Your Name"
git config --global user.email "your-verified-or-noreply-email@example.com"
git config --global init.defaultBranch main
```

To verify the settings:

```powershell
git config --global --get user.name
git config --global --get user.email
git config --global --get init.defaultBranch
```

Authenticate using GitHub Desktop/Git Credential Manager or the supported GitHub CLI flow; do not try to use your GitHub account password as a Git HTTPS password. GitHub supports HTTPS and SSH authentication. Official guide: <https://docs.github.com/en/get-started/git-basics/set-up-git>.

### Small Git workflow for AI-assisted development

- Keep `main` as the known-good branch.
- Make a separate branch for each approved implementation task, such as `feature/app-shell` or `feature/rtc-spike`.
- Before allowing the agent to edit, check the current branch and `git status`.
- After implementation, require tests/lint/typecheck/build checks as appropriate; inspect the diff before committing.
- Make one focused commit after the task passes review, then merge it into `main` (prefer a pull request if GitHub is being used for reviews).
- Never accept a bulk rewrite or auto-fix that touches unrelated files without reviewing the diff.

Useful checks from the project root:

```powershell
git status --short --branch
git remote -v
git branch --show-current
git diff --stat
git diff
```

## 5. Preliminary technology findings (not yet frozen)

**Web research checked on 2026-10-18; the application repository is not yet available.** Do not treat these observations as a final dependency lockfile.

- Expo's official create-project page currently documents an SDK 58 template: `npx create-expo-app@latest --template default@sdk-58`. It also notes that during the SDK 58 transition, bare `create-expo-app@latest` still creates an SDK 57 project and Expo Go distribution for SDK 58 is not yet available in the app stores. Expo SDK 58 was announced on **2026-10-15** and includes React Native 0.88. Because voice RTC and in-app purchases require native integration, use a development build; do not choose a version only because it is newest. Sources: <https://expo.dev/changelog/sdk-58> and <https://docs.expo.dev/get-started/create-a-project/>.
- Expo Router is documented for SDK 58, with a recommended version around `~58.0.20` at the time checked: <https://docs.expo.dev/versions/v58.0.0/sdk/router/>.
- Reanimated's compatibility matrix says the Reanimated 4.8.x line supports React Native 0.86–0.88, but exact Expo-bundled package versions and required `react-native-worklets` must be checked against the chosen SDK: <https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/>.
- LiveKit's official Expo guide confirms its React Native SDK uses native packages/config plugins and is not compatible with Expo Go; a development build is required. The guide is not enough by itself to prove the newest Expo SDK's exact compatibility, so RTC selection remains a technical-spike decision: <https://docs.livekit.io/home/quickstarts/expo/>.
- Expo's in-app purchase guide states that purchase libraries require custom native code and development builds; it lists `react-native-purchases`/RevenueCat and `expo-iap` as candidate options. Purchase choice remains open until product/business requirements and backend verification are known: <https://docs.expo.dev/guides/in-app-purchases/>.

### Provisional candidates, not final decisions

- Mobile: React Native + TypeScript + Expo, pinned to the newest stable SDK that passes native compatibility checks.
- Routing: Expo Router.
- Server state: TanStack Query.
- Shared transient client state: Zustand only where truly shared; local React state for local UI.
- Forms/schemas: React Hook Form + Zod.
- Icons: `lucide-react-native` candidate; verify SVG peer compatibility and licensing/version status.
- Animation/gestures: SDK-compatible Reanimated + Gesture Handler; test bottom sheet strategy before adopting another library.
- Images: `expo-image`; animated GIF support must be verified on target devices.
- Voice: evaluate LiveKit vs Agora using a small native development-build proof of concept on iOS and Android.
- Backend (if none exists): modular TypeScript/NestJS API, PostgreSQL, and Redis are candidates from the architecture document. Decide whether client/backend share a monorepo only after seeing the repo and deployment preferences. Select Prisma or Drizzle, not both.
- Purchases: candidate library depends on store requirements; backend verification is mandatory.

## 6. Recommended implementation plan after repository access

The master prompt says the first response must not change code. The architecture document's original Phase 0 includes build/RTC spikes, which require approved implementation work. To avoid this mismatch, follow the stricter non-writing master prompt first, then run those spikes as explicitly approved implementation tasks.

| Task | Scope | Acceptance criteria / definition of done |
|---|---|---|
| **P0-A: repository audit and decisions (read-only)** | Inspect actual repo, Git state, scripts, app/backend boundaries, CI, secrets handling, native config and all context. Verify live dependency compatibility and document unresolved questions. | Audit reflects actual files and exact commands; all 100 references available; library decision table has official evidence; roadmap/task contracts approved. No code modifications. |
| **P1: minimal project foundation** | After approval, establish or adapt Expo TypeScript baseline, lockfile/package manager, env example/validation, lint/format/typecheck/test scripts, error boundary and a minimal runnable route. Preserve existing architecture if healthy. | Install is reproducible from lockfile; lint, format check, typecheck and base tests pass; app runs in target dev environment; `.env` secrets ignored; no features beyond baseline shell. |
| **P2: native/RTC compatibility spike** | Build a minimal development client and validate a candidate RTC SDK, mic permission, connect/disconnect, mute/unmute, interruption/reconnect behavior. Compare alternatives before choosing. | Provider choice backed by findings; native build succeeds for available target platforms; basic multi-user audio test completed or explicitly marked NOT TESTED; limitations and costs documented. |
| **P3: design system and navigation shell** | Five tabs, safe areas, theme tokens, typography, icon conventions, route groups and reusable primitive components. Inspect screens 075, 082, 090–094, 097–100. | All five tab routes work; stable IDs and back behavior; lint/typecheck/tests pass; RTL scaffold works; no unrelated screens or fake production integrations. |
| **P4: Home discovery and profile vertical slice** | Discovery modes share one reusable list pattern; typed mock/API adapter; profile shell with Profile/Honor/Moments/Relationships tabs. Inspect 001, 024–028, 097–100. | Switching modes preserves expected state; open profile/back returns to list state; loading/empty/error states work; tests and visual QA cover representative small/large mobile sizes. |
| **P5: room shell and room lifecycle** | Room details, canvas, seat/listener/speaker states, exit flow and session controller; integrate selected RTC adapter only within approved scope. Inspect 002–015 and 090–094. | Opening/closing details/tools does not recreate the session; leave cleans up; permission denied and reconnect states are honest; room behavior tested on available devices. |
| **P6: messages and app realtime** | Inbox, contacts, direct thread, system notices, room invitations, typed WebSocket/app-event contracts. Inspect 014, 076–083, 086, 088–089. | Message retry/idempotency and unread state have tests; chat composer is keyboard-safe; block/report entry points are present; no audio transported over app WebSocket. |
| **P7: gift UI and wallet backend contract** | Gift panel categories with mock catalog first; backend-authoritative gift command and wallet ledger; idempotency, insufficient balance and approved-event effects. Inspect 004–012 and 057, 061–072. | UI cannot mutate balance; duplicate requests cannot double-charge; insufficient balance and retry are tested; production mode refuses unverified transactions. No real purchase integration until provider/policy approval. |
| **P8: relationships, Moments and communities** | Friend/couple invitation states, intimacy, feed/post detail and family/community discovery. Inspect 016–028, 054, 076–078, 084–085, 095–096. | pending/accepted/rejected/expired paths are tested; feed pagination and media upload states behave; block/privacy rules are enforced server-side. |
| **P9: Store, inventory, memberships and utilities** | Shared catalog/data-driven tier templates, backpack, tasks, visitors, levels, event center and settings. Inspect 029–073 and 055–060, 073–075. | Reused templates cover tier/category variants; lock states explain eligibility; claim/upgrade/purchase actions depend on backend state; no copied proprietary production art. |
| **P10: release hardening** | Performance, accessibility, RTL, moderation/privacy audit, crash analytics, app-store purchase/policy checks, CI and critical-path E2E. | Required checks pass on available platforms; untested hardware/platform cases documented; no secrets in bundle; release/rollback checklist complete. |

Every row is a planning boundary, not blanket approval to implement the whole roadmap. Break a row into smaller contracts if the diff or risk becomes too large. Require explicit approval at each task gate.

## 7. Exact blocker and next step

The screen/document context audit is complete. The remaining blocker is the **actual application repository**. Create the private GitHub repository and make it available to your coding agent, or provide a repository URL plus the workspace/access path in the tool you use. Then rerun P0-A in that repository. Do not create app source files or install packages until the read-only audit is reviewed and you approve the first task.

**Approval gate:** No application implementation has started. Next proposed task: P0-A against the real app repository, read-only. Awaiting repository availability and your approval of the resulting plan.
