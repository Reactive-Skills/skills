---
name: jsm-workflow
description: Prove behavior in the real product or service.
type: reactive
---

# VERIFY

## Objective

Exercise the running product or service against approved criteria.

## Deliverables

- Target, commands or steps, per-criterion result, and observed failures.

## Constraints

Use the real app, route, command, service, or integration when available.
Do not rely only on code inspection or edit code in this phase.
Do not mark a criterion passed without observed evidence.

## Uncertainty

Record unavailable environment or credentials as a deferred check.
Compare ambiguous behavior to the approved scope or spec.
If evidence invalidates an accepted decision, emit `DECISION_REOPENED`.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Every available criterion has pass or fail evidence.
- Failures include steps and observed versus expected behavior.
- Deferred checks name the missing access or environment.

## Task

Update `verification_record` with checks, pass state, failures, deferred items, evidence, and next action.
Emit `VERIFY_PASSED`, `VERIFY_FAILED`, `VERIFY_DEFERRED`, `DECISION_REOPENED`, or `DOD_CHANGE_REQUESTED`.
