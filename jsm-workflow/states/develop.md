---
name: jsm-workflow
description: Implement the scoped and designed change.
type: reactive
---

# DEVELOP

## Context

This phase turns the approved scope, spec, and project context into working code.
It follows the source corpus pattern where develop acts after a spec gate.

## Objective

Build the smallest implementation that satisfies the current slice.

## Deliverables

- Changed code files.
- Updated local assets or styles when the slice requires them.
- Build or type check result.
- Scope status update when the repo uses scope files.
- Decision gap report when implementation would require guessing.

## Constraints

Read the governing scope, spec, and nearest project context before writing code.
Do not invent load bearing decisions during implementation.
Apply the input coverage test: enumerate every value this build must produce, compute, or display. For each, verify the spec names where it comes from. Any required value with no named source is an owed decision.
If a decision is owed and unrecorded, stop and offer three choices:
1. Architect it first: emit `DECISION_NEEDED` (routes to ARCHITECT).
2. No decision needed: proceed only if it is a genuine local implementation detail.
3. Build now, record as Assumed spec: create `docs/specs/NNNN-<slug>.md` with `Status: Assumed`, flag the feature in scope as `assumed decision (spec NNNN)`, and proceed with building. The flag does not block marking done.
Move existing spec status from `Proposed` to `In Progress` when building starts. Never move an `Assumed` spec out of `Assumed`.
If the build includes user interface work and no design system exists yet, ask the user for visual direction (brand, reference site, or propose one) and mood (e.g., calm & light, dark & focused, bold) before writing CSS. Check color contrast to accessibility standards.
Keep edits focused on the current slice.
Do not refactor unrelated code.
Do not mark work complete without a local self check.

## Uncertainty

If implementation needs a provider, data source, UI direction, integration behavior, or cross cutting pattern that the spec does not name, apply the decision gate options above.
If a command cannot run in the local environment, state the command and reason.

## Atomic Gate

- The governing scope or task is known.
- The governing spec is present, an Assumed spec was recorded, or the work is proven to be pure implementation.
- If UI was built from scratch, direction and mood were confirmed and contrast was verified.
- The nearest project context was read when present.
- The implementation changed only the intended surfaces.
- A build, type check, or equivalent self check was attempted or a specific blocker was recorded.

## Task

Implement the current slice from the available scope, spec, and context.
If UI is built from scratch, interview the user on direction/mood before creating design.md and CSS.
Derive manual verification steps from the acceptance criteria and ask the user whether to save them to `verify.md` beside the spec.
Update `build_record` with `summary`, `changed_files`, `self_check_command`, `self_check_result`, `decision_gaps`, `assumed_spec_path`, and `scope_update`.
Emit `BUILD_READY` when the build is ready for behavior verification.
Emit `DECISION_NEEDED` when design input is required before code can proceed.
Emit `BUILD_FAILED` when implementation fails after a reproducible error is captured.
