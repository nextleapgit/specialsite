# Phase 00 — Production workspace foundation

- Confirm approved reference and requirements are intact; no prototype mock behavior is mislabeled as production functionality.
- Inspect actual local/remote repository context and preserve any existing work. Establish main baseline and phase/00-governance safely in VS Code.
- Validate the reference and governance scripts from this layout. Create appropriate CI, verify real main protection, and define required check names from actual runs.
- Implement and verify the phase-completion record after merge without circular approval or direct-main bypass. Keep all valid findings blocking.
- Obtain real Claude extension review with exact-source evidence and correct report provenance; never fabricate approvals.
- Pass required checks and phase security assessment; create and verify the phase PR, merge it only when ready, and confirm checks on the merged result.
- Only then record verified completion and begin phase 01 contracts. Backend implementation has not started.

Initial round count is zero. The collection contains no prior approval/test records and must not claim their results apply to this new layout.

## Acceptance IDs

| ID | Acceptance condition | Verification |
| --- | --- | --- |
| GOV-00-01 | Preserve the approved prototype without changing its source, assets or lockfile. | `git diff main -- reference/prototype` is empty. |
| GOV-00-02 | Inspect local context and authenticated remote history before initialization; retain a baseline and separate phase branch. | Git history, origin, branch and startup report. |
| GOV-00-03 | Run fresh reference and governance checks; retain unsuccessful attempts without calling them reviews. | Quality logs with source digest and actual exit codes. |
| GOV-00-04 | Provide CI for the reference, governance, security and independent-review evidence. | Workflow plus successful live required checks on the latest PR revision. |
| GOV-00-05 | Verify private repository protection, including required checks, strict updates, conversation resolution and no force-push/delete/admin bypass. | Authenticated GitHub settings; unavailable protection blocks completion. |
| GOV-00-06 | Implement and test post-merge completion recording without self-approval or direct-main bypass. | Regression tests and verified merge/check evidence. |
| GOV-00-07 | Obtain and import an actual Claude extension review for the exact source, with no open valid findings. | Unmodified extension response and passing evidence gate. |
| GOV-00-08 | Merge only when all conditions hold; verify merged checks before advancing. | PR URL, merge SHA and fresh successful checks; phase 01 remains planned until then. |

## File scope

- `.github/workflows/`, `.vscode/`, root package/configuration files.
- `scripts/governance/` and associated tests when required for this phase.
- `docs/governance/`, `docs/handoff/` and `docs/phases/`.
- `reference/prototype/` is preserved; generated dependencies, builds and browser diagnostics stay ignored.
- No production backend, UI migration or phase 01 architecture work belongs to this phase.

## Required checks

Local: `lint`, `typecheck`, `unit-component`, `governance`, `build`, `budgets`, `e2e-accessibility-visual`, `dependency-audit`, `secret-scan`, followed by the phase security assessment and actual independent review.

CI candidate check names: `reference-quality`, `governance-security`, `phase-evidence`. These names must be confirmed from real runs before configuring required checks. A workflow file alone does not prove CI success or branch protection. The reference runs on Windows to use the existing approved visual baselines; no automatic snapshot replacement is permitted.

Post-merge verification: `npm run phase:complete -- 00 PR_NUMBER`, then a record-only protected PR and `npm run phase:verify`. See `docs/governance/completion.ar.md`. The three evidence jobs run on phase pushes, main pushes and PRs; none may be skipped as proof of merged success.

## User-requested coordinator extension

GOV-00-09: provide sequential Codex/Claude CLI handoff from a VS Code task, with subscription preflight, a single-owner lock, frozen source/evidence, genuine raw response provenance, crash recovery without duplicate completed rounds, and a four-round stop. Verify with regression tests and a separately labeled live transport check. Preserve the unsubmitted pre-coordinator packet under attempts; do not invent or reset completed reviews.
