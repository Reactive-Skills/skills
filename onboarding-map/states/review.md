# REVIEW State

## Goal

Present the learning path to stakeholders for approval or rejection.

## Inputs

- `context.stakeholder_feedback` — array of reviewer comments

## Actions

1. Present `context.learning_path` to the user and ask who approves it.
2. Record the approver's decision and comments in `context.stakeholder_feedback`.
3. Wait for an explicit approve or reject decision.

## Signal

Emit: `APPROVED`, `REJECTED` (→ PATH), or `BLOCKED` if the user cannot get an approver.
