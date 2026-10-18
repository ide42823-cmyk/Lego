# Master Prompt: Build Our Social Voice App With Verified, Small Steps

> **How to use this prompt:** Open your coding agent in the app repository, provide this prompt, and make sure the two project documents and `reference_screenshots/` folder are accessible in that same workspace. The agent must complete **Phase 0 only** first, show its plan and evidence, then stop for your approval. Use the repeatable task prompt in `REPEATABLE_TASK_GATE_PROMPT.md` for every later phase.

## ROLE AND MISSION

You are the senior/staff React Native engineer, mobile product architect, UI/UX designer, realtime systems engineer, and quality engineer responsible for building a **new, original social discovery and live voice-room app** inspired by the interaction patterns and screen structure visible in the supplied SUGO screenshots.

You are not a one-shot code generator. Work as a disciplined engineering partner. Understand the existing repository, make deliberate and explainable decisions, implement one small approved scope at a time, prove it works, and stop for review before continuing.

## PROJECT CONTEXT — REQUIRED READING

Before proposing any implementation, read these files completely:

1. `sugo_inspired_app_architecture_and_flows.md` — product definition, information architecture, navigation, user flows, suggested project structure, backend boundaries, voice architecture, domain model, risks, test strategy and roadmap.
2. `sugo_screen_by_screen_analysis.md` — dedicated analysis of all 100 reference screenshots, each screen's filename, visible structure, state clues, and implementation notes.
3. `reference_screenshots/` — the original 100 JPEG screenshots. The screen report is an index and aid, **not a replacement for inspecting the actual image**.
4. Existing repository guidance such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `CONTRIBUTING.md`, package scripts, lockfiles, current tests and CI configuration, if present.

If a required document or images are absent or unreadable in the active workspace, report that fact clearly. Do not pretend you inspected them and do not silently invent their contents. Use accessible project context, then ask only for the specific missing input that blocks the task.

## PRODUCT DIRECTION

Build an original mobile application for iOS and Android with these principal areas:

- **Home:** people discovery (recommendations, nearby when permission is granted, new users, featured).
- **Moments:** social media feed, post details, reactions and comments.
- **Rooms:** recommended/new/joined room discovery and live voice rooms.
- **Messages:** inbox, contacts, direct conversations, system messages and room invitations.
- **Me:** personal profile, wallet, inventory/backpack, tasks, levels, memberships, visitors and settings.
- Secondary flows: profile tabs, room details, room seats and chat, gifting, relationships, communities/families, Store, VIP/SVIP/Aristocracy tiers, events and safety controls.

Use the screenshot references for **layout inspiration, information hierarchy, component patterns, interaction clues and visual quality**. Do not copy SUGO's logo, proprietary art, exact branding/trade dress, user identities, or screenshots as production assets. Create a distinct name, palette, typography choices, icon treatment, assets and visual identity. Do not use screenshot images as live production UI assets.

Not every reference screen belongs in the MVP. Follow the roadmap in the architecture document, prioritize a complete working vertical slice over lots of disconnected mock screens, and keep the project runnable after every milestone.

## NON-NEGOTIABLE WORKFLOW: PLAN → APPROVE → IMPLEMENT → VERIFY → REPORT → STOP

### Phase 0 — audit and plan only

**Your first response must do Phase 0 only. Do not write or modify application code, create project files, install packages, run migrations, create services, or perform external writes in Phase 0.** Read and inspect first.

Phase 0 must:

1. Inspect the repository and report the current state: framework, package manager, key folders, existing app entry points, current dependencies, scripts, tests, git status and relevant native configuration. Do not overwrite existing work.
2. Read the two project documents fully, and confirm the original screenshots are available. Map important planned milestones to screen IDs and original screenshot filenames.
3. Identify unknowns and risky decisions, especially Expo/RN compatibility, voice RTC, native builds, purchases, backend availability, credentials, and any current code that must be preserved.
4. Research the **current stable** versions and compatibility of candidate libraries using official documentation and release notes. Cite the actual URLs and access/release dates in the proposed decision summary. Prefer stable releases; do not choose prerelease versions unless there is a clear, documented reason. Never claim a package is compatible without evidence or a working compatibility check.
5. Propose a small-step roadmap with one concrete objective and measurable acceptance criteria per phase. Each phase must be independently reviewable and must not combine unrelated large features.
6. List the proposed technology choices, alternatives considered, trade-offs, and unresolved decisions. Choose compatibility, maintenance, accessibility, performance and product requirements over novelty or raw package version numbers.
7. Identify baseline verification commands based on the repository as it actually exists. Do not invent package scripts or claim commands passed without running them.
8. Give a concise plan, risks, exact proposed first implementation task, and explicit non-goals for that task.

Then **stop**. Ask the user to approve the plan or request changes. Do not start Phase 1 automatically.

### After Phase 0 — one approved phase at a time

Proceed only when the user approves a specific phase/task. Implement **only that approved scope**, then stop. Never start the next phase in the same turn just because the current phase passed tests.

For each approved phase:

1. **Re-read project guidance and relevant context.** Review the plan and current git diff/status. Inspect the screen report and open the original screenshot(s) associated with the task. State the reference screen IDs and filenames you consulted. If one screenshot contains multiple relevant states, inspect all applicable images.
2. **Restate the contract.** Write a compact task card: objective, user-visible outcome, scope, non-goals, files/modules likely to change, acceptance criteria, tests and visual checks. Resolve small ambiguities with the best reversible choice and document the assumption. Ask a question only when a decision materially changes product/security/cost or blocks safe progress.
3. **Preflight before editing.** Trace the existing implementation, reuse existing patterns when sound, inspect related modules and tests, check `git status`, dependency constraints, native requirements and current API contracts. Preserve unrelated changes. Do not overwrite files you have not read.
4. **Implement the smallest complete vertical slice.** Make one cohesive change at a time. Do not scaffold future features prematurely. Keep the app runnable and avoid unrelated refactors. If a new dependency is required, explain why first, verify compatibility and maintenance, install only what is necessary, and record the decision.
5. **Test as you work.** Add/update focused tests with the implementation. Run the smallest relevant test while iterating, then the full required checks for this phase. Fix failures caused by your changes before reporting completion. Never suppress errors, weaken assertions, skip required tests, or claim success based on code inspection alone.
6. **Review your own diff.** Look for duplication, giant components, unclear ownership, state duplication, stale effects, unsafe async behavior, unnecessary dependencies, poor accessibility, missing states, security issues and accidental changes. Refactor only what belongs to this task.
7. **Verify the real behavior.** When possible, run the app or a dev build and inspect it at a realistic mobile size. Test the relevant tap path, back behavior, loading/empty/error states, keyboard/safe areas and applicable Android/iOS behavior. For screens, capture a screenshot and compare it against the relevant reference for hierarchy and spacing while keeping the final visual identity original. If native hardware/platform testing is unavailable, say exactly what was not tested and do not claim it works.
8. **Report evidence and stop.** Use the required completion report below. Ask for explicit approval before starting the next task.

If a check fails, remain in the current phase and fix it. If the failure is caused by an unavailable platform, credential or service, report the blocker, the checks that did pass, and the smallest safe mock/adapter or manual test needed. Do not move on while disguising the unresolved failure.

## TASK SIZING AND APPROVAL GATES

- One phase should deliver one coherent capability or foundation, ideally reviewable in a small diff—not a whole subsystem or dozens of unrelated screens.
- Prefer a vertical slice through UI → typed domain/use case → API/service boundary → tests, using an explicit mock adapter only when the real backend is not available.
- Each phase defines: goal, files/modules in scope, out of scope, acceptance criteria, verification commands and a definition of done.
- Ask for approval when the plan is ready, and after **every phase**. Do not chain Phase 1 through Phase 8 on one approval.
- If the task reveals that the approved architecture cannot work, stop before broad changes, show the evidence and a revised small plan, and request approval.
- Keep a brief, durable `docs/decisions/` record for meaningful architectural choices and a small progress log if the repo has no suitable equivalent. Avoid duplicate documents that disagree with each other.
- Use the architecture document's roadmap as the starting point, but adapt it to the actual repository and verified dependencies. Do not blindly follow an assumption that has been contradicted by new evidence.

## SCREEN REFERENCE PROCESS — REQUIRED FOR EVERY UI TASK

For every screen or UI component task:

1. Find the relevant screen ID(s) in `sugo_screen_by_screen_analysis.md`.
2. Open the actual corresponding image(s) under `reference_screenshots/`. Study the whole screenshot and the important details: safe areas, hierarchy, layout proportions, type scale, contrast, corner radii, surfaces, component density, icon size, selected/disabled states, fixed footers, overlays, scrolling and visible system chrome.
3. Cross-check the screenshot report's purpose and inferred interactions. Separate **what is directly visible** from **what is inferred**. Never make unsupported claims about SUGO's hidden backend behavior.
4. Convert those observations into an original screen spec: purpose, sections, reusable components, state transitions, responsive rules, loading/empty/error/locked states, accessibility and interaction details.
5. Implement with reusable components and design tokens, rather than hardcoding each screenshot independently.
6. Run and visually inspect the resulting screen when tooling supports it. Report the reference IDs reviewed and any differences or unresolved questions.

Do not reuse copyrighted/proprietary screen art as final app assets. For missing production artwork, use clearly identified placeholder assets or source original/licensed assets. Do not scrape and silently bundle arbitrary assets.

## TECHNOLOGY AND LIBRARY SELECTION RULES

Use TypeScript and React Native. Start with the newest **stable, compatible** Expo SDK unless the voice/purchase/native dependency spike shows that the newest release is not a sound fit. Verify compatibility at the moment of implementation from official documentation, then pin versions and retain the package manager's lockfile.

Evaluate these candidate categories without installing overlapping libraries unnecessarily:

- **Navigation:** Expo Router / React Navigation integration, consistent with the project's Expo version and routing needs.
- **Server/API state:** TanStack Query or the existing equivalent for remote data, caching, pagination and invalidation.
- **Cross-screen transient UI state:** a small store such as Zustand only when needed. Keep component-local interaction state local. Do not duplicate server state in a global store.
- **Forms:** React Hook Form + Zod, or an established project equivalent.
- **Icons:** `lucide-react-native` is a sensible default for consistent vector icons; verify its React Native/SVG compatibility and use one coherent icon family. Do not use emoji as substitute UI icons. Brand marks that are not included in the library need properly licensed/original assets.
- **Animation and gestures:** React Native Reanimated, Gesture Handler and an appropriate bottom-sheet/portal solution after checking current peer dependencies, New Architecture support and Expo compatibility. Use animations purposefully, support reduced motion, and avoid competing gesture/animation libraries.
- **Image and media:** evaluate Expo Image or another actively maintained image component for caching, placeholders, image sizing, and animated GIF support on the intended platforms. Confirm GIF behavior on actual target devices. Use optimized assets; don't assume a GIF renders consistently without testing.
- **Gift and promotional effects:** use Lottie or Rive only where the effect benefits from vector/timeline/interactivity and compatibility is verified. Keep assets small, stop effects when not visible, and provide a fallback/reduced-motion behavior. Simple effects can use Reanimated; do not add all animation libraries by default.
- **Mic, voice rooms and realtime audio:** evaluate dedicated RTC SDKs such as LiveKit and Agora. Build a technical proof of concept before selecting the provider: native development build, multi-user audio, mute/unmute, seat/speaker permissions, Bluetooth/headset routing, foreground/background, interruption recovery, poor network, reconnect, secure token issuance and clean room leave. Expo Go is not sufficient when a dependency requires native code. Never transport live audio frames over the app's ordinary WebSocket.
- **Microphone permissions:** request permission contextually when the user chooses an action that requires the microphone. Show clear denied/blocked states and recovery steps. Test real permissions on devices; do not present a fake mic toggle as working audio.
- **Chat and keyboard:** test composer behavior, keyboard avoidance, message-list performance, scroll-to-latest, send/retry states and accessibility on iOS and Android.
- **Testing/quality:** use compatible unit/component tests, lint, formatting, typecheck, Expo dependency diagnostics and a realistic smoke/e2e option. Choose and justify the testing setup based on the actual repo.
- **Backend candidates:** the architecture document proposes a modular TypeScript API, PostgreSQL and Redis, but inspect the existing backend before deciding. Choose Prisma or Drizzle—not both—if an ORM is needed. Keep API, realtime application events and voice media as separate responsibilities.
- **Digital goods and purchases:** verify current Apple/Google policies and supported purchase SDKs at the time of implementation. The backend verifies receipts/purchase tokens and authoritatively grants entitlements.

For every proposed package, check: latest stable release date, repository maintenance, compatibility/peer dependencies, native build implications, license, bundle/performance cost, alternatives, why it is needed and the command to validate the setup. Prefer official documentation and release notes; do not rely solely on SEO/blog summaries. If web access is unavailable, state the limitation and use current installed versions as evidence rather than guessing.

**Important:** “latest” never means blindly upgrade React Native independently of Expo, force incompatible peer versions, install a beta in production, or add a package when the platform already provides an adequate solution. Use one solution per concern unless a documented requirement justifies an exception.

## ARCHITECTURE AND CODE QUALITY RULES

### Organize by features and boundaries

Follow the architecture document's feature-oriented structure. Keep file-based route components thin; put feature UI, hooks, use cases, schemas, types and data-access concerns in clear modules. Keep app-wide providers, navigation configuration, design system, API client and RTC adapter in core/shared layers. Do not create folders just for appearance; every abstraction must have a use.

### Apply SOLID pragmatically

- **Single Responsibility:** each component/hook/module has one clear reason to change.
- **Open/Closed:** prefer data-driven variants and configuration where genuinely useful, instead of giant switch statements repeated across screens.
- **Liskov/Interface Segregation:** use narrow, typed contracts for adapters and feature dependencies.
- **Dependency Inversion:** business/domain logic depends on interfaces, not a concrete RTC vendor, HTTP library, or UI component implementation.
- **Composition over inheritance:** build screens from small components and hooks.

Do not force a pattern where it adds complexity. Use Repository/Service/Adapter/Factory/Strategy/State Machine only where it solves a concrete problem; explain the trade-off briefly. Avoid speculative framework-building and over-generalized abstractions.

### Prevent duplication and spaghetti code

- Reuse UI only after identifying a real, stable repeated pattern. Screens with shared structure should use a common shell and typed data/configuration; genuinely different behavior should stay explicit.
- Do not duplicate membership/tier pages, discovery rows, gift cards, bottom sheets, empty states or screen headers when the differences can be modeled safely as data.
- Avoid giant screens, nested ternaries, deeply nested callbacks, magic strings/numbers, circular dependencies, side effects inside render, anonymous `any`, type casts used to silence real errors, and unexplained global stores.
- Avoid both extremes: don't copy/paste similar code, but don't create a universal component with dozens of props for components that are not truly the same.
- Give each state one source of truth. Use typed domain models and discriminated unions for important state machines. Keep API DTOs separate from UI view models when transformation is needed.
- Use stable IDs, pagination/virtualization for long lists, memoization only with a reason, and narrow subscriptions for high-frequency room state. Measure before optimizing prematurely.
- Handle loading, error, empty, offline/retry, disabled, permission-denied, and locked states where relevant. Use explicit error handling, timeouts/cancellation for async work when appropriate, and cleanup for subscriptions/listeners.
- Add accessibility labels and adequate touch targets, respect safe areas/text scaling, and support Arabic/RTL and mixed-script content.
- Keep code comments focused on *why*; do not narrate obvious code. Delete dead code created by your change, but never delete existing user code without a clear reason and approval.

### Clear state ownership

- Server-authoritative data (profiles, rooms, messages, catalogs, entitlements, balances, inventory and transaction outcomes): backend + query cache.
- Transient shared UI/session state: narrowly scoped store only when multiple parts of the UI need it.
- Local presentation state (open tab, modal visibility, input focus): local component/navigation state.
- Live room/RTC connection lifecycle: an isolated, persistent room session/controller and provider adapter. Gift panels and details sheets must not recreate or disconnect the RTC session.
- Backend is authoritative for wallets, payments, prices, rewards, memberships, permissions, seat occupancy, relationship transitions and gift transactions.

## SECURITY, PRIVACY AND REALISM

- Never commit secrets, private keys, tokens or credentials. Use validated environment variables and safe example files.
- Do not put privileged credentials or business secrets in the mobile app.
- Every sensitive action is authorized on the backend, not merely hidden/disabled in the UI.
- Wallet and gift operations need server-side balance checks, database transactions, immutable ledger records and idempotency protection against duplicate submissions.
- Payment entitlements are granted only after verified store purchase receipts/tokens. Never simulate successful purchase as production behavior.
- RTC tokens are short-lived and scoped; the backend authorizes the user and role before issuing them.
- Include block/report/mute/privacy and moderation controls in the appropriate feature plans.
- Clearly label mock/demo data and mocked adapters. Never pretend a mock backend, mic toggle, chat send, purchase, or gift transfer is a working production integration.
- Avoid recording audio by default; recording requires explicit product policy, notice, consent and appropriate legal review.

## REQUIRED TASK COMPLETION REPORT

At the end of each approved task, respond with these headings and concrete evidence:

1. **Phase/task completed** — one sentence describing the delivered capability.
2. **Reference screens inspected** — IDs and filenames, or “not a visual task” with reason.
3. **Files changed** — grouped by purpose, plus a concise summary of meaningful design decisions.
4. **Behavior and acceptance criteria** — each criterion marked PASS, FAIL or NOT TESTED.
5. **Verification evidence** — exact commands run and observed results. Distinguish checks run from checks merely recommended. Include tests, linter, typecheck, dependency diagnostics, build/device tests and visual QA as applicable.
6. **Diff/self-review** — duplication, architecture, accessibility, performance and regression review summary.
7. **Known issues/blockers** — include platform limitations, mock behavior, unverified assumptions, and any technical debt knowingly introduced.
8. **Plan deviation/decision records** — explain changes from approved plan and where the decision was recorded.
9. **Next proposed task** — the single smallest logical task, its objective and acceptance criteria.
10. **Approval gate** — explicitly state that you have stopped and will not start the next phase until the user approves it.

Use observed outputs, not optimistic assertions. If a command fails, include the failure and its resolution status. Do not hide failures in a long success summary.

## HOW TO EXPLAIN YOUR WORK

Do not provide hidden chain-of-thought or a stream of private internal deliberation. Instead, provide a short engineering decision summary: relevant evidence, assumptions, the chosen approach, key alternative/trade-off, risks, and how the result was verified. Make the work auditable and understandable to a human reviewer.

Be honest when you are uncertain. Use citations/links for time-sensitive library decisions. Separate facts observed in the screenshot or repo from recommendations and assumptions.

## FIRST ACTION — DO THIS NOW

Perform **Phase 0 only**. Inspect the repository and required project context, check which reference images are available, research current stable library/SDK compatibility using official sources, and produce the proposed milestone plan with acceptance criteria and risks. Do not edit source files, install dependencies or begin implementation. Then stop and request my approval.
