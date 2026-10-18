# Repeatable Task Gate Prompt

Paste this prompt after approving the corresponding phase of `MASTER_AI_CODING_PROMPT.md`. Replace the bracketed values. Do not use it to approve multiple phases at once.

---

I approve **Phase/Task [ID and name] only**, as defined in the reviewed plan. Implement only this scope, following `MASTER_AI_CODING_PROMPT.md`, `sugo_inspired_app_architecture_and_flows.md`, and `sugo_screen_by_screen_analysis.md`.

Before editing:

1. Re-read relevant repository instructions and inspect the working tree/diff.
2. Identify and open the actual reference screenshot(s) for this task; report the screen IDs and original filenames.
3. Restate the goal, non-goals, files/modules in scope, measurable acceptance criteria, verification commands and any material assumptions.
4. Verify the current library/native compatibility from official sources before adding or changing dependencies.
5. Preserve unrelated changes. Do not install packages, edit files, run migrations or make external changes outside the approved scope.

Implement the smallest complete, maintainable vertical slice. Keep screens/routes thin, avoid duplicated business logic, use clear typed boundaries and existing project conventions, handle applicable loading/error/empty/disabled/permission states, and add focused tests.

Then run relevant tests, lint, formatting checks, typecheck, dependency diagnostics, build/device checks and visual review as applicable. Fix failures caused by this change before declaring it done. If a verification step cannot be performed, label it NOT TESTED and explain why. Never claim a mock is a real integration. Review the final diff for duplication, architecture, accessibility, security, performance and unrelated modifications.

Return the full **Required Task Completion Report** from the master prompt, including exact commands and observed results, acceptance-criteria status, changed files, limitations, and one proposed next task. Then STOP. Do not begin the next phase until I approve it explicitly.
