---
name: jsm-workflow
description: Reconcile durable context, scope status, and decision status from repo evidence.
type: reactive
---

# SYNC

## Objective

Reconcile durable workflow files with evidence from this change.

## Deliverables

- Changed files, context updates, scope and spec statuses, and stale gaps.

## Constraints

Use repo evidence, make surgical edits, and preserve curated prose.
Do not add or reorder scope items.
Change spec content only to update an evidence supported lifecycle status.

## Uncertainty

Stop and report conflicts with curated context.
Recommend an audit when area knowledge is missing.
If evidence changes an accepted decision, emit `DECISION_REOPENED`.
If the user or evidence changes the approved outcome without reopening a decision, emit `DOD_CHANGE_REQUESTED` with the full `dod_record` plus `pending_diff`, `revision_reason`, and `downstream_work_to_rerun`.

## Atomic Gate

- Needed durable updates are complete or explicitly unnecessary.
- Unsafe edits are reported.
- Final lifecycle status is clear.

## Task

Update `sync_record` with outcome, artifacts, checks, blockers, next action, context, scope, and spec updates.
Emit `SYNCED`, `SYNC_BLOCKED`, `DECISION_REOPENED`, or `DOD_CHANGE_REQUESTED`.
