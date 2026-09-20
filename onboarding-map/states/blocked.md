# BLOCKED State

## Goal

Signal that human intervention is required to proceed.

## Causes

- No stakeholder responded within the review timeout.
- Missing mandatory context that cannot be auto-inferred.

## Actions

1. Log the blocker reason in `context.stakeholder_feedback`.
2. Notify the workflow owner via preferred channel (e.g. Slack, email).

## Signal

Terminal — no forward transitions. Emit `BLOCKED` for external observers.
