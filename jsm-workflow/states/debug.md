---
name: jsm-workflow
description: Reproduce failures, prove the root cause, apply the smallest fix, and verify it.
type: reactive
---

# DEBUG

## Context

This phase handles failures from build, verification, tests, or review.
It follows the source corpus loop: reproduce, localize, hypothesize, test the hypothesis, fix, verify.

## Objective

Find and fix the proven root cause of one failure without adding unrelated changes.

## Deliverables

- Exact symptom.
- Deterministic reproduction or instrumentation plan.
- Localized failing surface.
- Confirmed root cause.
- Minimal fix.
- Verification result after the fix.
- Regression test handoff when needed.

## Constraints

Do not patch symptoms before the cause is proven.
Test one hypothesis at a time.
Do not mix unrelated refactors into the fix.
If the failure is caused by a flawed design decision, route back to design rather than hiding it in code.

## Uncertainty

If the failure cannot be reproduced, ask for steps, inputs, environment, and observed versus expected behavior.
If multiple causes are possible, record the current hypothesis and the experiment that proves or rejects it.

## Atomic Gate

- The symptom and expected behavior are explicit.
- A reproduction exists, or missing reproduction data is named.
- The root cause is supported by evidence.
- The fix is minimal and directly addresses the cause.
- The original failing check was rerun or the blocker is recorded.

## Task

Investigate the failure and apply the smallest proven fix.
Update `debug_record` with `symptom`, `reproduction`, `root_cause`, `fix`, `verification`, `regression_test`, and `blocked_reason`.
Emit `BUG_FIXED` when the fix is verified and the lifecycle should recheck behavior.
Emit `DESIGN_FLAW` when the root cause is a wrong or missing design decision.
Emit `DEBUG_BLOCKED` when reproduction data or required environment access is missing.
