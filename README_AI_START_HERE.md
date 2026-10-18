# Start Here — AI Coding Agent Context

This bundle contains the working context for building an original React Native social discovery and live voice-room app inspired by the supplied SUGO reference screenshots.

## Files

- `MASTER_AI_CODING_PROMPT.md` — initial prompt for the coding agent. Requires an audit and plan first; no code changes in Phase 0.
- `REPEATABLE_TASK_GATE_PROMPT.md` — reusable prompt to approve and execute exactly one task/phase at a time.
- `sugo_inspired_app_architecture_and_flows.md` — product architecture, flows, tech direction, data/backend boundaries, risks and roadmap.
- `sugo_screen_by_screen_analysis.md` — individual notes for all 100 screenshots, screen IDs and original filenames.
- `reference_screenshots/` — original reference JPEGs, for visual inspection while implementing relevant screens.

## Recommended workflow

1. Open your AI coding agent in the actual application repository. Extract or copy these documents and the `reference_screenshots/` folder into a location the agent can read.
2. Paste the entire `MASTER_AI_CODING_PROMPT.md` into the agent. Make sure it has repository and terminal access if expected to inspect code and run checks.
3. Review the Phase 0 repository audit, package compatibility findings and proposed phase plan. Correct assumptions before approving.
4. Approve exactly one phase at a time. For each later phase, use `REPEATABLE_TASK_GATE_PROMPT.md` with the specific phase ID/name.
5. Check the agent's test outputs and diff. Only approve the next phase after you're satisfied with the current phase.

The archive is context for the agent, not the app itself. Screenshots are inspirations, not production assets. Any mock behavior must be labeled as such until a real backend or native provider has been implemented and verified.
