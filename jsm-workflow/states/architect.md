---
name: jsm-workflow
description: Settle load bearing design decisions before implementation.
type: reactive
---

# ARCHITECT

## Objective

Settle decisions needed to implement the scoped outcome.

## Required

- Map acceptance seeds to decisions or exclusions.
- Name every build value's source.
- Record options, recommendation, rationale, build order, and numbered spec criteria.
- For load bearing decisions, record ADR path, alternatives, and consequences.
- For reopened decisions, name changes and downstream work to rerun.

## Rules

Read ~/.agents/OPINIONS.md when present and ground choices in the request, repo, and approved principles.
Prefer reversible choices; ask only at user owned crossroads.
Do not write code or another phase's context.

## Atomic Gate

- Spec path and status are clear; values have sources.
- ADR need is explicit and any required ADR is complete.
- Deferred decisions name blocked work.

## Task

Write the spec under `docs/specs/` or `.workflow/specs/` and update `decision_record` with summary, paths, status, choices, consequences, and sources.
For an accepted outcome or load bearing change, update spec and ADR, then emit `DOD_AMENDMENT_REQUIRED`.
Before initial approval, update its draft and continue through `SPEC_READY`.
Emit `DECISION_DEFERRED` when a required choice is deferred, or `DESIGN_FLAW_CONFIRMED` when scope must change.
