---
name: jsm-workflow
description: Ensure durable project context exists and matches the work area.
type: reactive
---

# AUDIT

## Context

This phase gives later work durable context.
It follows the source corpus pattern where project conventions live in `AGENTS.md`.

## Objective

Confirm that the repo has enough project context for implementation.

## Deliverables

- Root context status.
- Area context status.
- Relevant conventions for the current work.
- Missing context items that would make implementation unsafe.
- Created or updated `AGENTS.md` files when appropriate.

## Constraints

Do not overwrite curated context.
Do not duplicate `AGENTS.md` content into tool specific files.
Create nested context only when the current evidence covers that area well enough.
Do not create specs or code in this phase.

## Uncertainty

If existing context conflicts with repo evidence, flag the conflict and stop before changing curated prose.
If the area predates the change and lacks context, recommend a focused audit rather than inventing full area knowledge from a slice.

## Atomic Gate

- The implementation phase has a clear source for project conventions.
- Any context edits are surgical and evidence based.
- Any missing context that blocks build work is named.
- No curated context was overwritten.

## Task

Verify or create the project context needed for this change.
Update `context_record` with `summary`, `root_context_status`, `area_context_status`, `context_paths`, `edits`, `conflicts`, and `missing_context`.
Emit `CONTEXT_READY` when implementation can use the available context and design/spec is already in place.
Emit `AUDIT_TO_SCOPE` when running on an existing codebase (brownfield) to establish AGENTS.md before scoping the next slice.
Emit `CONTEXT_BLOCKED` when missing or conflicting context requires human direction.
