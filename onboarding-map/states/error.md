# ERROR State

## Goal

Handle unrecoverable failures during onboarding.

## Causes

- `SCAN_FAILED`: No modules discovered in repo.
- `MAP_FAILED`: Dependency graph could not be built.
- `PATH_FAILED`: Learning path generation failed.
- `REVIEW_FAILED`: Stakeholder feedback system error.

## Actions

1. Capture error context in `context.stakeholder_feedback`.
2. Emit diagnostic summary for debugging.

## Signal

Terminal — no forward transitions. Emit `ERROR` for external observers.
