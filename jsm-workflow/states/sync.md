---
name: jsm-workflow
description: Reconcile durable context, scope status, and decision status from repo evidence.
type: reactive
---

# SYNC

## Context

This phase closes the lifecycle loop.
It follows the source corpus pattern where sync updates durable knowledge from the completed change.

## Objective

Make durable workflow files match the repo evidence produced by this change.

## Deliverables

- Changed source file set.
- Context updates or explicit no update result.
- Scope status reconciliation.
- Spec status reconciliation.
- Stale spec or context gap report.

## Constraints

Use repo evidence, not memory.
Make surgical edits only.
Do not rewrite curated context.
Do not add or reorder scope features.
Do not edit spec content except lifecycle status when evidence supports it.

## Uncertainty

If evidence conflicts with curated context, flag the conflict and stop.
If an area predates this change and lacks context, recommend an audit instead of inventing area knowledge.
If sync shows the repo evidence no longer matches the accepted decision, emit `DECISION_REOPENED`.

## Atomic Gate

- The change set is known.
- Durable files that needed updates were updated surgically.
- Unsafe edits are reported instead of forced.
- The final lifecycle status is clear.

## Task

Synchronize durable context and lifecycle artifacts from repo evidence.
Update `sync_record` with `outcome`, `changed_artifacts`, `checks`, `blockers`, `next_action`, `context_updates`, `scope_updates`, and `spec_updates`.
Emit `SYNCED` when sync is complete or nothing needs sync.
Emit `SYNC_BLOCKED` when a conflict or missing authority prevents safe sync.
Emit `DECISION_REOPENED` when final reconciliation changes a load bearing decision.
