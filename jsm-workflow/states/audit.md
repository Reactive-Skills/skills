---
name: jsm-workflow
description: Ensure durable project context exists and matches the work area.
type: reactive
---

# AUDIT

## Objective

Confirm project context is sufficient for the planned work.

## Deliverables

- Root and area context status and paths.
- Relevant conventions, edits, conflicts, and missing context.

## Constraints

Do not overwrite curated context, duplicate it into tool specific files, or create specs or code.
Create nested context only when evidence supports it.

## Uncertainty

If context conflicts with repo evidence, stop and report the conflict.
For established codebases without context, recommend a focused audit before scope.

## Atomic Gate

- Build conventions have a named source.
- Context edits are surgical and evidence based.
- Blocking gaps are named; curated prose is intact.

## Task

Verify or create the context needed for this change.
Update `context_record` with summary, statuses, paths, edits, conflicts, and gaps.
Emit `CONTEXT_READY` when design and context are ready before DoD approval.
When `dod_record.status` is `approved`, emit `CONTEXT_REFRESHED` after an amendment refresh without another approval.
Emit `AUDIT_TO_SCOPE` for a brownfield context audit that must precede scoping, or `CONTEXT_BLOCKED` when human direction is required.
