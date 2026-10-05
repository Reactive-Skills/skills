---
name: jsm-workflow
description: Capture the work request, repo state, and completion target.
type: reactive
---

# INTAKE

## Objective

Create a bounded request record and identify facts needed for a useful DoD.

## Deliverables

- Request, target repo or area, outcome, final output, format, and setup needs.
- Constraints, assumptions, blockers, and lifecycle route.

## Constraints

Ask only for missing facts that prevent safe planning.
Do not infer business rules or user only facts.
Draft observable criteria and label assumptions.
Do not choose architecture, tools, or write code here.

## Atomic Gate

- Request, target, and testable outcome are named.
- Route type and expected output are known, or a blocking fact is recorded.

## Task

Update `work_request` with summary, target, outcome, expected output, setup needs, constraints, assumptions, route type, and blockers.
Set `context.run_id` through `contextUpdates` when absent; it is not the runtime job id that `reactive_emit_signal` reports, and every INTAKE exit signal is refused until it is set.
Run artifacts render under `artifact_base`/`run_id`, and `artifact_base` defaults to `.docs/jsm-workflow`.
Emit `WORK_REQUEST_READY` for scoped work, `BUG_FIX_REQUESTED` for bugs, `AUDIT_REQUESTED` for brownfield-first work, or `DIRECT_BUILD_REQUESTED` for ready pre-specced changes.
Emit `INTAKE_BLOCKED` only when a required fact cannot be inferred safely.
