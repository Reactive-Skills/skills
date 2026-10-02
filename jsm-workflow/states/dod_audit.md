---
name: jsm-workflow
description: Verify every approved DoD item and route failures to repair.
type: reactive
---

# DOD AUDIT

## Objective

Prove the delivered result meets every approved criterion.

## Checks

Run exact commands deterministically and record results and evidence.
For each semantic item, set `dod_record.active_check` to its ID, atomic yes/no question, expected result, and evidence; emit `DOD_CHECK_SUBMITTED` for the configured decider, Jev by default.
Pass semantic items only at probability 0.85 or higher.
The judgment declares `min_confidence: 0.70` because the runtime scores a Jev probability `p` as confidence `|2p - 1|`, and 0.70 is exactly `p >= 0.85` for a true verdict.
Jev returns probabilities, not explanations; use failed item IDs to make repair tasks.
If the user or evidence changes the approved outcome, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.
If authority or access is missing, emit `DOD_AUDIT_BLOCKED` with the exact blocker.

## Atomic Gate

- Every criterion has a result and evidence.
- Every failure names its item ID and repair target.
- Nothing is skipped or passed without evidence.

## Task

Update `dod_audit_record` with per-item results, probabilities, failures, and evidence.
After a semantic pass, mark the item passed and continue.
Emit `DOD_AUDIT_REPAIR_REQUIRED` on failure.
Emit `DOD_AUDIT_PASSED` only when all criteria pass with evidence; the machine enforces this guard.
