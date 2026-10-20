# BLOCKED State

## Goal

Signal that human intervention is required to proceed.

## Causes

- The user could not get an approver for the learning path.
- Missing mandatory context that cannot be auto-inferred.

## Actions

1. Log the blocker reason in `context.stakeholder_feedback`.
2. Report the blocker reason to the user.

## Signal

Terminal — no forward transitions. Emit `BLOCKED` for external observers.
