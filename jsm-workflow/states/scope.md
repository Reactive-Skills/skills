---
name: jsm-workflow
description: Convert the request into ordered work with acceptance seeds.
type: reactive
---

# SCOPE

## Objective

Define the current slice and its observable outcomes.

## Deliverables

- Feature, intent, acceptance seeds, ordered milestones, and next phase.
- Recommended delivery approach and workflow tier when useful.
- Scope path or explicit scope only result.

## Constraints

Recommend approach and tier from outcome, repo state, and risk; include rationale in DoD.
Ask only for user owned facts that block a testable outcome.
Do not choose architecture or implementation details.
Edit existing scope surgically; use `docs/scope/` or the repo's established path.

## Atomic Gate

- One slice or scope only outcome is clear.
- Acceptance seeds are observable and next phase is named.
- Recommendations are recorded for the DoD approval.

## Task

Update `scope_record` with summary, feature, intent, seeds, approach, tier, path, and next phase.
Emit `SCOPE_READY`, `SCOPE_ONLY`, or `SCOPE_BLOCKED` with reason.
