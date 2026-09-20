---
name: jsm-workflow
description: Runtime setup failed or execution became unsafe.
type: reactive
---

# ERROR

## Context

This state means the skill cannot continue safely.

## Objective

Explain the failure and the minimum recovery step.

## Deliverables

- Failure reason.
- Last safe phase.
- Recovery command or user action.

## Constraints

Do not attempt lifecycle work from this state.
Do not modify files.

## Atomic Gate

- Failure reason is known or reported as unknown.
- Recovery step is concrete.
- No further mutation occurs.

## Task

Report the error and stop.
