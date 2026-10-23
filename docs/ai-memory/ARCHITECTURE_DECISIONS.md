# Architecture Decision Record Index

> Durable decision memory. Add a dated record for meaningful decisions; never silently erase history. If a decision is reversed, mark the old record SUPERSEDED and link the new record.
>
> Note: the project's detailed, screen-level design ADRs live in `docs/decisions/` (`0001`–`0004`, the fourth covering the app shell/design system through P13). This file indexes cross-cutting decisions and links there.

## ADR-000 — Do not treat prompt-mentioned technologies as final without evidence
- **Date:** 2026-10-23
- **Status:** Accepted (standing rule)
- **Context:** Project requirements call for a React Native social discovery and live voice-room app based on supplied SUGO screenshot references.
- **Decision:** Do not treat candidate technologies mentioned in prompts as final until the current repository, stable versions, native compatibility, and official documentation are checked.
- **Alternatives considered:** Selecting a full stack before inspecting the repository; rejected because it can create dependency conflicts and unnecessary complexity.
- **Consequences:** Technology choices are recorded after evidence review and approval.

## ADR-100 — Server-authoritative "honesty" seam for fixtures
- **Date:** 2026-10-23 (recorded; derived from `docs/decisions/0003`–`0004` practice)
- **Status:** Accepted
- **Context:** The front end runs on fixtures while the backend is deferred, but several surfaces in the reference app imply money, entitlement, delivery, or rank.
- **Decision:** Out-of-scope controls toast "… arrives with the backend phase." No client coin arithmetic, fake success, delivery claims, read receipts for *new* actions, entitlement, or rank position. Historical fixture facts the seam already owns (like-counts, thread-bubble confirmation checks, favorites) may be *displayed* as data, but nothing a client action triggers may be fabricated. Wallet/SVIP/couples/rank-history pages stay unbuildable until the backend exists.
- **Alternatives considered:** Local echoes/optimistic UI for sends and purchases; rejected as dishonest and inconsistent with future server state.
- **Consequences:** The conversation thread's composer keeps the draft on send and never appends a bubble; the green check beside outgoing history bubbles is seam-confirmed history, not a delivery promise.
- **Affected modules:** `src/app/thread/[id].tsx`, `src/components/chat/*`, `src/core/data/*`.

## Decision record template

### ADR-NNN — <short title>
- **Date:** YYYY-MM-DD
- **Status:** Proposed / Accepted / Rejected / Superseded
- **Context/problem:**
- **Decision:**
- **Alternatives considered:**
- **Reasoning/evidence:** include official documentation URLs and compatibility facts where relevant.
- **Consequences/trade-offs:**
- **Affected modules/files:**
- **Supersedes / superseded by:**
