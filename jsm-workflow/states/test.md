---
name: jsm-workflow
description: Write or update tests for durable behavior.
type: reactive
---

# TEST

## Context

This phase protects behavior that should stay true after the change.
It follows the source corpus pattern where tests target changed source files and acceptance criteria.

## Objective

Add or update automated tests that cover durable behavior.

## Deliverables

- Test scope from changed files or named target.
- Test strategy by file type or behavior type.
- Test files or updated test cases.
- Test command and result.
- Uncovered criteria with reason.

## Constraints

Test behavior callers rely on, not implementation trivia.
Do not lock in scaffolding that the slice intentionally leaves temporary.
Do not modify application code to make a test pass in this phase.
Do not install missing tools without explicit approval.

## Uncertainty

If no test tool is configured, ask how to proceed or record a gate only choice.
If a criterion cannot be automated, record why and leave it for verification.
If tests reveal that the intended behavior should change, emit `DECISION_REOPENED`.

## Atomic Gate

- Test scope is tied to changed files, governing requirements, or a user named target.
- Each stable automated criterion has a corresponding test or a reason it is not automatable.
- The chosen test command is recorded.
- Test run result is recorded, or the reason it was not run is explicit.

## Task

Write or update tests for the durable behavior in this change.
Update `test_record` with `scope`, `strategy`, `files`, `command`, `result`, `uncovered_criteria`, and `install_deferred`.
Emit `TEST_PASSED` when tests were written and the relevant suite passes.
Emit `TEST_FAILED` when tests reveal a reproducible code failure.
Emit `TEST_DEFERRED` when tests are intentionally skipped or cannot run in this environment.
Emit `DECISION_REOPENED` when test evidence or user direction changes a load bearing decision.
