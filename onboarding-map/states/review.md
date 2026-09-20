# REVIEW State

## Goal

Present the learning path to stakeholders for approval or rejection.

## Inputs

- `context.stakeholder_feedback` — array of reviewer comments

## Actions

1. Share `context.learning_path` with identified stakeholders.
2. Collect feedback into `context.stakeholder_feedback`.
3. Wait for explicit `APPROVED` or `REJECTED` signal.

## Signal

Emit: `APPROVED`, `REJECTED` (→ PATH), or `BLOCKED` if no response within timeout.
