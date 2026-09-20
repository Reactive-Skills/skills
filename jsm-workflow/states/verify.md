---
name: jsm-workflow
description: Prove behavior in the real product or service.
type: reactive
---

# VERIFY

## Context

This phase proves that the built change works in the running product or service.
It follows the source corpus pattern where verification checks behavior that green tests can miss.

## Objective

Exercise the user visible or service visible behavior against the acceptance seeds or spec requirements.

## Deliverables

- Verification target.
- Commands, browser steps, requests, or manual checks used.
- Result for each acceptance criterion that can be verified now.
- Failure evidence with exact observed and expected behavior.

## Constraints

Use the real app, service, route, command, or integration boundary when available.
Do not rely only on implementation inspection.
Do not edit code in this phase.
Do not mark a criterion passed without observed evidence.

## Uncertainty

If a criterion cannot be verified locally, explain the missing environment or credential.
If behavior is ambiguous, compare it to the governing scope or spec before deciding.
If verification shows the agreed decision is wrong, emit `DECISION_REOPENED` instead of forcing a code fix.

## Atomic Gate

- Each verifiable acceptance seed has a pass or fail result.
- Each failure includes reproduction steps and observed versus expected behavior.
- Deferred checks name the missing environment or authority.
- No code was edited during verification.

## Task

Verify the current change against its observable requirements.
Update `verification_record` with `checks`, `passed`, `failures`, `deferred`, `evidence`, and `next_action`.
Emit `VERIFY_PASSED` when all available checks pass.
Emit `VERIFY_FAILED` when any required check fails with reproducible evidence.
Emit `VERIFY_DEFERRED` when verification cannot run locally but testing can still proceed.
Emit `DECISION_REOPENED` when the user changes direction or evidence invalidates a load bearing decision.
