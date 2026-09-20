---
name: jsm-workflow
description: Summarize outcome and next action.
type: reactive
---

# COMPLETE

## Context

This is the terminal success or deliberate stop state.
The run may have completed the full lifecycle or stopped at an approved boundary.

## Objective

Report the result in a compact, evidence based handoff.

## Deliverables

- Final lifecycle phase reached.
- Files or artifacts changed.
- Checks run and their result.
- Open blockers or deferred work.
- One next action when useful.

## Constraints

Do not continue work from this state.
Do not invent verification results.
Do not omit blockers.

## Atomic Gate

- Outcome is stated.
- Verification or test status is stated when implementation occurred.
- Remaining work is explicit.
- No additional state transition is needed.

## Task

Summarize the lifecycle result and stop.
