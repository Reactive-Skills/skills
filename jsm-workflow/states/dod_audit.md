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
For each semantic item, emit `DOD_CHECK_SUBMITTED` for the configured decider, Jev by default, with the full `dod_record` in `contextUpdates` and its `active_check` set to the item ID, atomic yes/no question, expected result, and evidence.
Pass semantic items only at probability 0.85 or higher.
The judgment declares `min_probability: 0.85`.
Jev judges only the `active_check` in this signal's `contextUpdates.dod_record`, not a check stored by an earlier signal, so every `DOD_CHECK_SUBMITTED` must carry its own.
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
Emit `DOD_AUDIT_PASSED` only when all criteria pass with evidence, and include the final `dod_record` in its `contextUpdates`.
The machine enforces this guard against the `dod_record` in the signal, or the stored one when the signal omits it.
A refused signal does not transition, so fix the record and emit again.
