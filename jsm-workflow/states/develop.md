---
name: jsm-workflow
description: Implement the scoped and designed change.
type: reactive
---

# DEVELOP

## Objective

Build the smallest change that meets the approved DoD.

## Rules

Read governing scope, spec, and nearby context before editing.
Trace produced values to named sources; do not invent load bearing decisions.
Follow approved UI direction and verify contrast for new UI.
Choose compatible reversible details and avoid unrelated refactors.
If an unlisted user-only choice becomes necessary, stop and emit `DECISION_NEEDED` with a DoD diff.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.
Record command and reason when a local check cannot run.

## Atomic Gate

- Scope, spec, and context are known or a valid exception is recorded.
- Only intended surfaces changed.
- Self check ran or its blocker is explicit.

## Task

Implement the current slice and update `build_record` with summary, files, self check, gaps, and scope status.
When returning from audit, repair `dod_audit_record.failed_item_ids` and record evidence.
For a bug without reproduction, route to DEBUG before editing.
For scope-only or audit-only work, emit `BUILD_SKIPPED`.
Otherwise emit `BUILD_READY`, `DECISION_NEEDED`, `DOD_CHANGE_REQUESTED`, or `BUILD_FAILED` with evidence.
