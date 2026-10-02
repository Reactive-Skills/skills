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

## Uncertainty

If reproduction data or access is missing, name the exact blocker.
If causes compete, record the hypothesis and proving experiment.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Root cause has evidence.
- Minimal fix addresses it directly.
- Original failing check was rerun or blocked explicitly.

## Task

Update `debug_record` with symptom, reproduction, cause, fix, verification, regression test, and blocker.
Emit `BUG_FIXED`, `DESIGN_FLAW`, `DOD_CHANGE_REQUESTED`, or `DEBUG_BLOCKED` with evidence.
