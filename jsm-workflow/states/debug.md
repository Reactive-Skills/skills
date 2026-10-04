---
name: jsm-workflow
description: Reproduce failures, prove the root cause, apply the smallest fix, and verify it.
type: reactive
---

# DEBUG

## Objective

Prove and fix one root cause without unrelated changes.

## Deliverables

- Symptom, expected behavior, reproduction, root cause, minimal fix, and rerun evidence.
- Regression test handoff when needed.

## Constraints

Reproduce before patching; test one hypothesis at a time.
Do not mix refactors into the fix.
Route design flaws back to ARCHITECT.
Each failure gets at most three repair attempts; `BUG_FIXED` is refused past the third.

## Uncertainty

If reproduction data or access is missing, name the exact blocker.
If causes compete, record the hypothesis and proving experiment.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Root cause has evidence.
- Minimal fix addresses it directly.
- Original failing check was rerun or blocked explicitly.
- `debug_record` names `failure_id`, `failure_evidence`, and `attempt`.

## Task

Update `debug_record` with symptom, reproduction, cause, fix, verification, regression test, and blocker.
Set `failure_id` to a stable name for the failing check, keep it while the same check fails, and use a new one when a check fails again after it passed.
Set `failure_evidence` to the exact failing command and its decisive error line, and fix only that error.
Set `attempt` to the stored attempt plus one for the same `failure_id`, or 1 for a new failure.
Carry the full `debug_record` in this signal's `contextUpdates`; `BUG_FIXED` reads only that record.
When the third attempt for a failure did not fix it, emit `DEBUG_BLOCKED` with every attempt's evidence.
Emit `BUG_FIXED`, `DESIGN_FLAW`, `DOD_CHANGE_REQUESTED`, or `DEBUG_BLOCKED` with evidence.
