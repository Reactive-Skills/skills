---
name: jsm-workflow
description: Summarize outcome and next action.
type: reactive
---

# COMPLETE

## Context

This is the terminal success state.
Blocked or incomplete work ends in BLOCKED.

## Objective

Report the result in a compact, evidence based handoff.

## Deliverables

- Final lifecycle phase reached.
- Files or artifacts changed.
- Checks run and their result.
- Open blockers or deferred work.
- One next action when useful.
- Final DoD status and evidence location.

## Constraints

Do not continue work from this state.
Do not invent verification results.
Do not omit blockers.

## Atomic Gate

- Outcome is stated.
- Verification or test status is stated when implementation occurred.
- Every approved DoD criterion is marked passed with evidence.
- No blocker or deferred required criterion remains.
- No additional state transition is needed.

## Task

Summarize the delivered result, DoD evidence, changed artifacts, and verification.
Do not claim success from an approval signal alone.
