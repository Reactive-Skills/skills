---
name: jsm-workflow
description: Write or update tests for durable behavior.
type: reactive
---

# TEST

## Objective

Cover stable behavior callers rely on.

## Deliverables

- Test scope, strategy, files, command, result, and uncovered criteria.

## Constraints

Test behavior, not implementation trivia.
Do not modify application code to make a test pass here.
Install or configure tools only when named in the approved DoD.
If a required environment change is unapproved, request a DoD diff.

## Uncertainty

Use an existing project command or record why none can run.
Record non-automatable criteria for verification.
If evidence changes a decision, emit `DECISION_REOPENED`.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Stable criteria have tests or a reason they cannot be automated.
- Test command and result or blocker are recorded.
- Environment changes are covered by the DoD.

## Task

Update `test_record` with scope, strategy, files, command, result, gaps, and install status.
Emit `TEST_PASSED`, `TEST_FAILED`, `TEST_DEFERRED`, `DECISION_REOPENED`, or `DOD_CHANGE_REQUESTED`.
